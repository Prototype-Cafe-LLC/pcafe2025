import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  ShowButton,
  Edit,
  SimpleForm,
  TextInput,
  DateTimeInput,
  Create,
  UrlField,
  BooleanField,
  BooleanInput,
  Show,
  SimpleShowLayout,
} from 'react-admin'

export const EventList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="organizer_name" />
      <DateField source="start_date" />
      <TextField source="source_type" />
      <BooleanField source="is_published" />
      <BooleanField source="is_featured" />
      <UrlField source="event_url" />
      <ShowButton />
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
      <DateTimeInput source="start_date" required />
      <DateTimeInput source="end_date" />
      <BooleanInput source="is_all_day" />
      <TextInput source="organizer_name" required />
      <TextInput source="organizer_url" />
      <TextInput source="event_url" />
      <TextInput source="image_url" />
      <TextInput source="source_url" />
      <TextInput source="source_type" />
      <BooleanInput source="is_published" />
      <BooleanInput source="is_featured" />
    </SimpleForm>
  </Edit>
)

export const EventCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" required />
      <TextInput source="description" multiline rows={4} />
      <DateTimeInput source="start_date" required />
      <DateTimeInput source="end_date" />
      <BooleanInput source="is_all_day" />
      <TextInput source="organizer_name" required />
      <TextInput source="organizer_url" />
      <TextInput source="event_url" />
      <TextInput source="image_url" />
      <TextInput source="source_url" />
      <TextInput source="source_type" />
      <BooleanInput source="is_published" />
      <BooleanInput source="is_featured" />
    </SimpleForm>
  </Create>
)

export const EventShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="description" />
      <DateField source="start_date" />
      <DateField source="end_date" />
      <BooleanField source="is_all_day" />
      <TextField source="organizer_name" />
      <UrlField source="organizer_url" />
      <UrlField source="event_url" />
      <UrlField source="image_url" />
      <TextField source="source_url" />
      <TextField source="source_type" />
      <BooleanField source="is_published" />
      <BooleanField source="is_featured" />
      <TextField source="extracted_data" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
)