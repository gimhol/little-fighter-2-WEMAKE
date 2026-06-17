import { Form as _Form } from "../../Component/Form";
import Frame from "../../Component/Frame";
import { Input } from "../../Component/Input";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";

interface FormValues {
  name: string;
  email: string;
}

export default function FormDemo() {
  const [form, Form] = _Form.useForm<FormValues>();

  return (
    <Frame label='Form'>
      <Space direction='column'>
        <Form form={form}>
          <Form.Item label='Name' name='name'>
            <Input placeholder='Enter name' />
          </Form.Item>
          <Form.Item label='Email' name='email'>
            <Input placeholder='Enter email' />
          </Form.Item>
        </Form>
        <Titled label='Values'>
          <pre style={{ color: '#aaa', fontSize: 12 }}>
            {JSON.stringify(form.value, null, 2)}
          </pre>
        </Titled>
      </Space>
    </Frame>
  );
}
