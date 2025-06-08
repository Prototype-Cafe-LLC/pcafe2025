import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  Edit,
  SimpleForm,
  TextInput,
  DateTimeInput,
  Create,
  UrlField,
} from 'react-admin'

export const EventList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="organizer" />
      <DateField source="startDate" />
      <UrlField source="url" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
)

export const EventEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" required />
      <TextInput source="description" multiline rows={4} />
      <DateTimeInput source="startDate" required />
      <DateTimeInput source="endDate" />
      <TextInput source="organizer" required />
      <TextInput source="organizerUrl" />
      <TextInput source="url" />
    </SimpleForm>
  </Edit>
)

export const EventCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" required />
      <TextInput source="description" multiline rows={4} />
      <DateTimeInput source="startDate" required />
      <DateTimeInput source="endDate" />
      <TextInput source="organizer" required />
      <TextInput source="organizerUrl" />
      <TextInput source="url" />
    </SimpleForm>
  </Create>
)