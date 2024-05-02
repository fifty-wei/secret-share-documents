//! Serialize a Rust data structure into pretty-printed JSON data

use std::{error, fmt};

use serde::ser;

use std::vec::Vec;

use serde::ser::SerializeStruct as _;

use self::map::SerializeMap;
use self::seq::SerializeSeq;
use self::struct_::SerializeStruct;

mod map;
mod seq;
mod struct_;

/// Serialization result
pub type Result<T> = ::core::result::Result<T, Error>;

/// This type represents all possible errors that can occur when serializing JSON data
#[derive(Debug)]
#[non_exhaustive]
pub enum Error {
    /// Buffer is full
    BufferFull,

    /// Custom error message from serde
    Custom(String),
}

impl From<()> for Error {
    fn from(_: ()) -> Error {
        Error::BufferFull
    }
}

impl From<u8> for Error {
    fn from(_: u8) -> Error {
        Error::BufferFull
    }
}

impl error::Error for Error {
    fn source(&self) -> Option<&(dyn error::Error + 'static)> {
        None
    }

    fn description(&self) -> &str {
        "(use display)"
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::BufferFull => write!(f, "Buffer is full"),
            Error::Custom(msg) => write!(f, "{}", &msg),
        }
    }
}

/// Number of bytes reserved by default for the output JSON
static INITIAL_CAPACITY: usize = 1024;

/// Serializer implements serde::ser::Serializer and allows us to serialize a
/// serde struct into JSON
pub struct Serializer<'indent> {
    buf: Vec<u8>,
    current_indent: usize,
    indent: &'indent [u8],
}

impl<'indent> Serializer<'indent> {
    fn new(indent: &'indent [u8]) -> Self {
        Serializer {
            buf: Vec::with_capacity(INITIAL_CAPACITY),
            current_indent: 0,
            indent,
        }
    }

    /// Indent the content
    pub fn indent(&mut self) -> Result<()> {
        for _ in 0..self.current_indent {
            self.buf.extend_from_slice(self.indent);
        }
        Ok(())
    }
}

// NOTE(serialize_*signed) This is basically the numtoa implementation minus the lookup tables,
// which take 200+ bytes of ROM / Flash
macro_rules! serialize_unsigned {
    ($self:ident, $N:expr, $v:expr) => {{
        let mut buf = [0u8; $N];

        let mut v = $v;
        let mut i = $N - 1;
        loop {
            buf[i] = (v % 10) as u8 + b'0';
            v /= 10;

            if v == 0 {
                break;
            } else {
                i -= 1;
            }
        }

        $self.buf.extend_from_slice(&buf[i..]);
        Ok(())
    }};
}
// Export for use in map
pub(crate) use serialize_unsigned;

macro_rules! serialize_signed {
    ($self:ident, $N:expr, $v:expr, $ixx:ident, $uxx:ident) => {{
        let v = $v;
        let (signed, mut v) = if v == $ixx::min_value() {
            (true, $ixx::max_value() as $uxx + 1)
        } else if v < 0 {
            (true, -v as $uxx)
        } else {
            (false, v as $uxx)
        };

        let mut buf = [0u8; $N];
        let mut i = $N - 1;
        loop {
            buf[i] = (v % 10) as u8 + b'0';
            v /= 10;

            i -= 1;

            if v == 0 {
                break;
            }
        }

        if signed {
            buf[i] = b'-';
        } else {
            i += 1;
        }
        $self.buf.extend_from_slice(&buf[i..]);
        Ok(())
    }};
}
// Export for use in map
pub(crate) use serialize_signed;

/// Upper-case hex for value in 0..16, encoded as ASCII bytes
fn hex_4bit(c: u8) -> u8 {
    if c <= 9 {
        0x30 + c
    } else {
        0x41 + (c - 10)
    }
}

/// Upper-case hex for value in 0..256, encoded as ASCII bytes
fn hex(c: u8) -> (u8, u8) {
    (hex_4bit(c >> 4), hex_4bit(c & 0x0F))
}

impl<'serializer, 'indent: 'serializer> ser::Serializer for &'serializer mut Serializer<'indent> {
    type Ok = ();
    type Error = Error;
    type SerializeSeq = SerializeSeq<'serializer, 'indent>;
    type SerializeTuple = SerializeSeq<'serializer, 'indent>;
    type SerializeTupleStruct = Unreachable;
    type SerializeTupleVariant = SerializeSeq<'serializer, 'indent>;
    type SerializeMap = SerializeMap<'serializer, 'indent>;
    type SerializeStruct = SerializeStruct<'serializer, 'indent>;
    type SerializeStructVariant = SerializeStruct<'serializer, 'indent>;

    fn serialize_bool(self, v: bool) -> Result<Self::Ok> {
        if v {
            self.buf.extend_from_slice(b"true");
        } else {
            self.buf.extend_from_slice(b"false");
        }
        Ok(())
    }

    fn serialize_i8(self, v: i8) -> Result<Self::Ok> {
        // "-128"
        serialize_signed!(self, 4, v, i8, u8)
    }

    fn serialize_i16(self, v: i16) -> Result<Self::Ok> {
        // "-32768"
        serialize_signed!(self, 6, v, i16, u16)
    }

    fn serialize_i32(self, v: i32) -> Result<Self::Ok> {
        // "-2147483648"
        serialize_signed!(self, 11, v, i32, u32)
    }

    fn serialize_i64(self, v: i64) -> Result<Self::Ok> {
        // "-9223372036854775808"
        serialize_signed!(self, 20, v, i64, u64)
    }

    fn serialize_i128(self, v: i128) -> Result<Self::Ok> {
        // -170141183460469231731687303715884105728
        self.buf.push(b'"');
        let res: Result<Self::Ok> = serialize_signed!(self, 40, v, i128, u128);
        res?;
        self.buf.push(b'"');
        Ok(())
    }

    fn serialize_u8(self, v: u8) -> Result<Self::Ok> {
        // "255"
        serialize_unsigned!(self, 3, v)
    }

    fn serialize_u16(self, v: u16) -> Result<Self::Ok> {
        // "65535"
        serialize_unsigned!(self, 5, v)
    }

    fn serialize_u32(self, v: u32) -> Result<Self::Ok> {
        // "4294967295"
        serialize_unsigned!(self, 10, v)
    }

    fn serialize_u64(self, v: u64) -> Result<Self::Ok> {
        // "18446744073709551615"
        serialize_unsigned!(self, 20, v)
    }

    fn serialize_u128(self, v: u128) -> Result<Self::Ok> {
        // 340282366920938463463374607431768211455
        self.buf.push(b'"');
        let res: Result<Self::Ok> = serialize_unsigned!(self, 39, v);
        res?;
        self.buf.push(b'"');
        Ok(())
    }

    fn serialize_f32(self, _v: f32) -> Result<Self::Ok> {
        unreachable!()
    }

    fn serialize_f64(self, _v: f64) -> Result<Self::Ok> {
        unreachable!()
    }

    fn serialize_char(self, _v: char) -> Result<Self::Ok> {
        unreachable!()
    }

    fn serialize_str(self, v: &str) -> Result<Self::Ok> {
        self.buf.push(b'"');

        // Do escaping according to "6. MUST represent all strings (including object member names) in
        // their minimal-length UTF-8 encoding": https://gibson042.github.io/canonicaljson-spec/
        //
        // We don't need to escape lone surrogates because surrogate pairs do not exist in valid UTF-8,
        // even if they can exist in JSON or JavaScript strings (UCS-2 based). As a result, lone surrogates
        // cannot exist in a Rust String. If they do, the bug is in the String constructor.
        // An excellent explanation is available at https://www.youtube.com/watch?v=HhIEDWmQS3w

        // Temporary storage for encoded a single char.
        // A char is up to 4 bytes long when encoded to UTF-8.
        let mut encoding_tmp = [0u8; 4];

        for c in v.chars() {
            match c {
                '\\' => {
                    self.buf.push(b'\\');
                    self.buf.push(b'\\');
                }
                '"' => {
                    self.buf.push(b'\\');
                    self.buf.push(b'"');
                }
                '\u{0008}' => {
                    self.buf.push(b'\\');
                    self.buf.push(b'b');
                }
                '\u{0009}' => {
                    self.buf.push(b'\\');
                    self.buf.push(b't');
                }
                '\u{000A}' => {
                    self.buf.push(b'\\');
                    self.buf.push(b'n');
                }
                '\u{000C}' => {
                    self.buf.push(b'\\');
                    self.buf.push(b'f');
                }
                '\u{000D}' => {
                    self.buf.push(b'\\');
                    self.buf.push(b'r');
                }
                '\u{0000}'..='\u{001F}' => {
                    self.buf.push(b'\\');
                    self.buf.push(b'u');
                    self.buf.push(b'0');
                    self.buf.push(b'0');
                    let (hex1, hex2) = hex(c as u8);
                    self.buf.push(hex1);
                    self.buf.push(hex2);
                }
                _ => {
                    if c.len_utf8() == 1 {
                        self.buf.push(c as u8);
                    } else {
                        let encoded = c.encode_utf8(&mut encoding_tmp as &mut [u8]);
                        self.buf.extend_from_slice(encoded.as_bytes());
                    }
                }
            }
        }

        self.buf.push(b'"');
        Ok(())
    }

    fn serialize_bytes(self, _v: &[u8]) -> Result<Self::Ok> {
        unreachable!()
    }

    fn serialize_none(self) -> Result<Self::Ok> {
        self.buf.extend_from_slice(b"null");
        Ok(())
    }

    fn serialize_some<T: ?Sized>(self, value: &T) -> Result<Self::Ok>
    where
        T: ser::Serialize,
    {
        value.serialize(self)
    }

    fn serialize_unit(self) -> Result<Self::Ok> {
        // The unit type is a zero element tuple, so the consistent way to serialize this would be "[]".
        // However, for compatibility with serde_json we serialize to "null".
        self.buf.extend_from_slice(b"null");
        Ok(())
    }

    fn serialize_unit_struct(self, _name: &'static str) -> Result<Self::Ok> {
        // Unit struct is serialized to (serde_json compatible) "null"
        self.buf.extend_from_slice(b"null");
        Ok(())
    }

    fn serialize_unit_variant(
        self,
        _name: &'static str,
        _variant_index: u32,
        variant: &'static str,
    ) -> Result<Self::Ok> {
        self.serialize_str(variant)
    }

    fn serialize_newtype_struct<T: ?Sized>(self, _name: &'static str, value: &T) -> Result<Self::Ok>
    where
        T: ser::Serialize,
    {
        value.serialize(self)
    }

    fn serialize_newtype_variant<T: ?Sized>(
        self,
        _name: &'static str,
        _variant_index: u32,
        variant: &'static str,
        value: &T,
    ) -> Result<Self::Ok>
    where
        T: ser::Serialize,
    {
        self.current_indent += 1;
        self.buf.push(b'{');
        let mut s = SerializeStruct::new(self);
        s.serialize_field(variant, value)?;
        s.end()?;
        Ok(())
    }

    fn serialize_seq(self, _len: Option<usize>) -> Result<Self::SerializeSeq> {
        self.current_indent += 1;
        self.buf.push(b'[');

        Ok(SerializeSeq::new(self))
    }

    fn serialize_tuple(self, _len: usize) -> Result<Self::SerializeTuple> {
        self.serialize_seq(Some(_len))
    }

    fn serialize_tuple_struct(
        self,
        _name: &'static str,
        _len: usize,
    ) -> Result<Self::SerializeTupleStruct> {
        unreachable!()
    }

    fn serialize_tuple_variant(
        self,
        _name: &'static str,
        _variant_index: u32,
        variant: &'static str,
        len: usize,
    ) -> Result<Self::SerializeTupleVariant> {
        self.current_indent += 1;
        self.buf.push(b'{');
        self.serialize_str(variant)?;
        self.buf.push(b':');
        self.serialize_tuple(len)
    }

    fn serialize_map(self, _len: Option<usize>) -> Result<Self::SerializeMap> {
        self.current_indent += 1;
        self.buf.push(b'{');

        Ok(SerializeMap::new(self))
    }

    fn serialize_struct(self, _name: &'static str, _len: usize) -> Result<Self::SerializeStruct> {
        self.current_indent += 1;
        self.buf.push(b'{');

        Ok(SerializeStruct::new(self))
    }

    fn serialize_struct_variant(
        self,
        _name: &'static str,
        _variant_index: u32,
        variant: &'static str,
        _len: usize,
    ) -> Result<Self::SerializeStructVariant> {
        self.current_indent += 1;
        self.buf.extend_from_slice(b"{\n");
        self.indent()?;
        self.buf.push(b'"');
        self.buf.extend_from_slice(variant.as_bytes());
        self.buf.extend_from_slice(b"\": {");
        self.current_indent += 1;

        Ok(SerializeStruct::new(self))
    }

    fn collect_str<T: ?Sized>(self, _value: &T) -> Result<Self::Ok>
    where
        T: fmt::Display,
    {
        unreachable!()
    }
}

/// Serializes the given data structure as a pretty-printed string of JSON text
// #[cfg(feature = "heapless")]
pub fn to_string_pretty<T>(value: &T, indent: &[u8]) -> Result<String>
where
    T: ser::Serialize + ?Sized,
{
    let mut ser = Serializer::new(indent);
    value.serialize(&mut ser)?;
    Ok(unsafe { String::from_utf8_unchecked(ser.buf) })
}

/// Serializes the given data structure as a pretty-printed JSON byte vector
pub fn to_vec_pretty<T>(value: &T, indent: &[u8]) -> Result<Vec<u8>>
where
    T: ser::Serialize + ?Sized,
{
    let mut ser = Serializer::new(indent);
    value.serialize(&mut ser)?;
    Ok(ser.buf)
}

impl ser::Error for Error {
    fn custom<T>(msg: T) -> Self
    where
        T: fmt::Display,
    {
        Error::Custom(msg.to_string())
    }
}

/// Unreachable is a placeholder for features that are not supported
/// (and should be unreachable, unless you use unsupported serde flags)
pub enum Unreachable {}

impl ser::SerializeTupleStruct for Unreachable {
    type Ok = ();
    type Error = Error;

    fn serialize_field<T: ?Sized>(&mut self, _value: &T) -> Result<()> {
        unreachable!()
    }

    fn end(self) -> Result<Self::Ok> {
        unreachable!()
    }
}

impl ser::SerializeTupleVariant for Unreachable {
    type Ok = ();
    type Error = Error;

    fn serialize_field<T: ?Sized>(&mut self, _value: &T) -> Result<()> {
        unreachable!()
    }

    fn end(self) -> Result<Self::Ok> {
        unreachable!()
    }
}

impl ser::SerializeMap for Unreachable {
    type Ok = ();
    type Error = Error;

    fn serialize_key<T: ?Sized>(&mut self, _key: &T) -> Result<()>
    where
        T: ser::Serialize,
    {
        unreachable!()
    }

    fn serialize_value<T: ?Sized>(&mut self, _value: &T) -> Result<()>
    where
        T: ser::Serialize,
    {
        unreachable!()
    }

    fn end(self) -> Result<Self::Ok> {
        unreachable!()
    }
}

impl ser::SerializeStructVariant for Unreachable {
    type Ok = ();
    type Error = Error;

    fn serialize_field<T: ?Sized>(&mut self, _key: &'static str, _value: &T) -> Result<()>
    where
        T: ser::Serialize,
    {
        unreachable!()
    }

    fn end(self) -> Result<Self::Ok> {
        unreachable!()
    }
}

#[cfg(test)]
mod tests {

    use super::to_string_pretty;
    use serde::Serialize;
    // use serde_derive::Serialize;

    const INDENT: &[u8] = b"  ";

    #[test]
    fn enum_() {
        #[derive(Serialize)]
        enum Type {
            #[serde(rename = "boolean")]
            Boolean,
            #[serde(rename = "number")]
            Number,
        }

        assert_eq!(
            to_string_pretty(&Type::Boolean, INDENT).unwrap(),
            r#""boolean""#
        );

        assert_eq!(
            to_string_pretty(&Type::Number, INDENT).unwrap(),
            r#""number""#
        );
    }

    #[test]
    fn str() {
        assert_eq!(to_string_pretty("hello", INDENT).unwrap(), r#""hello""#);
        assert_eq!(to_string_pretty("", INDENT).unwrap(), r#""""#);

        // Characters unescaped if possible
        assert_eq!(to_string_pretty("ä", INDENT).unwrap(), r#""ä""#);
        assert_eq!(to_string_pretty("৬", INDENT).unwrap(), r#""৬""#);
        // assert_eq!(to_string_pretty("\u{A0}").unwrap(), r#"" ""#); // non-breaking space
        assert_eq!(to_string_pretty("ℝ", INDENT).unwrap(), r#""ℝ""#); // 3 byte character
        assert_eq!(to_string_pretty("💣", INDENT).unwrap(), r#""💣""#); // 4 byte character

        // " and \ must be escaped
        assert_eq!(
            to_string_pretty("foo\"bar", INDENT).unwrap(),
            r#""foo\"bar""#
        );
        assert_eq!(
            to_string_pretty("foo\\bar", INDENT).unwrap(),
            r#""foo\\bar""#
        );

        // \b, \t, \n, \f, \r must be escaped in their two-character escaping
        assert_eq!(to_string_pretty(" \u{0008} ", INDENT).unwrap(), r#"" \b ""#);
        assert_eq!(to_string_pretty(" \u{0009} ", INDENT).unwrap(), r#"" \t ""#);
        assert_eq!(to_string_pretty(" \u{000A} ", INDENT).unwrap(), r#"" \n ""#);
        assert_eq!(to_string_pretty(" \u{000C} ", INDENT).unwrap(), r#"" \f ""#);
        assert_eq!(to_string_pretty(" \u{000D} ", INDENT).unwrap(), r#"" \r ""#);

        // U+0000 through U+001F is escaped using six-character \u00xx uppercase hexadecimal escape sequences
        assert_eq!(
            to_string_pretty(" \u{0000} ", INDENT).unwrap(),
            r#"" \u0000 ""#
        );
        assert_eq!(
            to_string_pretty(" \u{0001} ", INDENT).unwrap(),
            r#"" \u0001 ""#
        );
        assert_eq!(
            to_string_pretty(" \u{0007} ", INDENT).unwrap(),
            r#"" \u0007 ""#
        );
        assert_eq!(
            to_string_pretty(" \u{000e} ", INDENT).unwrap(),
            r#"" \u000E ""#
        );
        assert_eq!(
            to_string_pretty(" \u{001D} ", INDENT).unwrap(),
            r#"" \u001D ""#
        );
        assert_eq!(
            to_string_pretty(" \u{001f} ", INDENT).unwrap(),
            r#"" \u001F ""#
        );
    }

    #[test]
    fn struct_bool() {
        #[derive(Serialize)]
        struct Led {
            led: bool,
        }

        assert_eq!(
            to_string_pretty(&Led { led: true }, INDENT).unwrap(),
            r#"{
  "led": true
}"#
        );
    }

    #[test]
    fn struct_i8() {
        #[derive(Serialize)]
        struct Temperature {
            temperature: i8,
        }

        assert_eq!(
            to_string_pretty(&Temperature { temperature: 127 }, INDENT).unwrap(),
            r#"{
  "temperature": 127
}"#
        );

        assert_eq!(
            to_string_pretty(&Temperature { temperature: 20 }, INDENT).unwrap(),
            r#"{
  "temperature": 20
}"#
        );

        assert_eq!(
            to_string_pretty(&Temperature { temperature: -17 }, INDENT).unwrap(),
            r#"{
  "temperature": -17
}"#
        );

        assert_eq!(
            to_string_pretty(&Temperature { temperature: -128 }, INDENT).unwrap(),
            r#"{
  "temperature": -128
}"#
        );
    }

    #[test]
    fn struct_option() {
        #[derive(Serialize)]
        struct Property<'a> {
            description: Option<&'a str>,
        }

        assert_eq!(
            to_string_pretty(
                &Property {
                    description: Some("An ambient temperature sensor"),
                },
                INDENT
            )
            .unwrap(),
            r#"{
  "description": "An ambient temperature sensor"
}"#
        );

        // XXX Ideally this should produce "{}"
        assert_eq!(
            to_string_pretty(&Property { description: None }, INDENT).unwrap(),
            r#"{
  "description": null
}"#
        );
    }

    #[test]
    fn struct_u8() {
        #[derive(Serialize)]
        struct Temperature {
            temperature: u8,
        }

        assert_eq!(
            to_string_pretty(&Temperature { temperature: 20 }, INDENT).unwrap(),
            r#"{
  "temperature": 20
}"#
        );
    }

    #[test]
    fn struct_() {
        #[derive(Serialize)]
        struct Empty {}

        assert_eq!(to_string_pretty(&Empty {}, INDENT).unwrap(), r#"{}"#);

        #[derive(Serialize)]
        struct Tuple {
            a: bool,
            b: bool,
        }

        assert_eq!(
            to_string_pretty(&Tuple { a: true, b: false }, INDENT).unwrap(),
            r#"{
  "a": true,
  "b": false
}"#
        );
    }

    #[test]
    fn test_unit() {
        let a = ();
        assert_eq!(to_string_pretty(&a, INDENT).unwrap(), r#"null"#);
    }

    #[test]
    fn test_newtype_struct() {
        #[derive(Serialize)]
        struct A(pub u32);
        let a = A(54);
        assert_eq!(to_string_pretty(&a, INDENT).unwrap(), r#"54"#);
    }

    #[test]
    fn test_newtype_variant() {
        #[derive(Serialize)]
        enum A {
            A(u32),
        }
        let a = A::A(54);

        assert_eq!(
            to_string_pretty(&a, INDENT).unwrap(),
            r#"{
  "A": 54
}"#
        );
    }

    #[test]
    fn test_struct_variant() {
        #[derive(Serialize)]
        enum A {
            A { x: u32, y: u16 },
        }
        let a = A::A { x: 54, y: 720 };

        assert_eq!(
            to_string_pretty(&a, INDENT).unwrap(),
            r#"{
  "A": {
    "x": 54,
    "y": 720
  }
}"#
        );
    }
}
