use serde::ser;

use super::{Error, Result, Serializer};

pub struct SerializeSeq<'serializer, 'indent> {
    ser: &'serializer mut Serializer<'indent>,
    first: bool,
}

impl<'serializer, 'indent: 'serializer> SerializeSeq<'serializer, 'indent> {
    pub(crate) fn new(ser: &'serializer mut Serializer<'indent>) -> Self {
        SerializeSeq { ser, first: true }
    }
}

impl<'serializer, 'indent: 'serializer> ser::SerializeSeq for SerializeSeq<'serializer, 'indent> {
    type Ok = ();
    type Error = Error;

    fn serialize_element<T: ?Sized>(&mut self, value: &T) -> Result<()>
    where
        T: ser::Serialize,
    {
        if !self.first {
            self.ser.buf.push(b',');
        }
        self.first = false;

        self.ser.buf.push(b'\n');
        self.ser.indent()?;

        value.serialize(&mut *self.ser)?;
        Ok(())
    }

    fn end(self) -> Result<Self::Ok> {
        self.ser.current_indent -= 1;
        if !self.first {
            self.ser.buf.push(b'\n');
            self.ser.indent()?;
        }
        self.ser.buf.push(b']');
        Ok(())
    }
}

impl<'serializer, 'indent: 'serializer> ser::SerializeTuple for SerializeSeq<'serializer, 'indent> {
    type Ok = ();
    type Error = Error;

    fn serialize_element<T: ?Sized>(&mut self, value: &T) -> Result<()>
    where
        T: ser::Serialize,
    {
        ser::SerializeSeq::serialize_element(self, value)
    }

    fn end(self) -> Result<Self::Ok> {
        ser::SerializeSeq::end(self)
    }
}

impl<'serializer, 'indent: 'serializer> ser::SerializeTupleVariant
    for SerializeSeq<'serializer, 'indent>
{
    type Ok = ();
    type Error = Error;

    fn serialize_field<T: ?Sized>(&mut self, value: &T) -> Result<()>
    where
        T: ser::Serialize,
    {
        ser::SerializeSeq::serialize_element(self, value)
    }

    fn end(self) -> Result<Self::Ok> {
        // close sequence
        self.ser.buf.push(b']');
        // close surrounding enum
        self.ser.buf.push(b'}');
        Ok(())
    }
}
