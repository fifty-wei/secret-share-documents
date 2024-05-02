use serde::ser;

use super::{Error, Result, Serializer};

pub struct SerializeStruct<'serializer, 'indent> {
    ser: &'serializer mut Serializer<'indent>,

    first: bool,
}

impl<'serializer, 'indent: 'serializer> SerializeStruct<'serializer, 'indent> {
    pub(crate) fn new(ser: &'serializer mut Serializer<'indent>) -> Self {
        SerializeStruct { ser, first: true }
    }
}

impl<'serializer, 'indent: 'serializer> ser::SerializeStruct
    for SerializeStruct<'serializer, 'indent>
{
    type Ok = ();

    type Error = Error;

    fn serialize_field<T: ?Sized>(&mut self, key: &'static str, value: &T) -> Result<()>
    where
        T: ser::Serialize,
    {
        // XXX if `value` is `None` we not produce any output for this field

        if !self.first {
            self.ser.buf.push(b',');
        }

        self.first = false;

        self.ser.buf.push(b'\n');

        self.ser.indent()?;

        self.ser.buf.push(b'"');

        self.ser.buf.extend_from_slice(key.as_bytes());

        self.ser.buf.extend_from_slice(b"\": ");

        value.serialize(&mut *self.ser)?;

        Ok(())
    }

    fn end(self) -> Result<Self::Ok> {
        self.ser.current_indent -= 1;

        if !self.first {
            self.ser.buf.push(b'\n');

            self.ser.indent()?;
        }

        self.ser.buf.push(b'}');

        Ok(())
    }
}

impl<'serializer, 'indent: 'serializer> ser::SerializeStructVariant
    for SerializeStruct<'serializer, 'indent>
{
    type Ok = ();

    type Error = Error;

    fn serialize_field<T: ?Sized>(&mut self, key: &'static str, value: &T) -> Result<()>
    where
        T: ser::Serialize,
    {
        // XXX if `value` is `None` we not produce any output for this field

        if !self.first {
            self.ser.buf.push(b',');
        }

        self.first = false;

        self.ser.buf.push(b'\n');

        self.ser.indent()?;

        self.ser.buf.push(b'"');

        self.ser.buf.extend_from_slice(key.as_bytes());

        self.ser.buf.extend_from_slice(b"\": ");

        value.serialize(&mut *self.ser)?;

        Ok(())
    }

    fn end(self) -> Result<Self::Ok> {
        for _ in 0..2 {
            self.ser.current_indent -= 1;

            if !self.first {
                self.ser.buf.push(b'\n');

                self.ser.indent()?;
            }

            self.ser.buf.push(b'}');
        }

        Ok(())
    }
}
