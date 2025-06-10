import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  EditButton,
  DeleteButton,
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  Create,
  ArrayInput,
  SimpleFormIterator,
  SelectInput,
  NumberField,
  ReferenceField,
  ChipField,
  FunctionField,
  Show,
  SimpleShowLayout,
  RichTextField,
} from 'react-admin'
import { RichTextInput } from 'ra-input-rich-text'

export const BlogList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="slug" />
      <TextField source="content_type" />
      <BooleanField source="is_published" />
      <BooleanField source="is_featured" />
      <FunctionField 
        label="Tags"
        render={(record: { tags?: string[] }) => 
          record.tags?.map((tag: string) => (
            <ChipField key={tag} record={{tag}} source="tag" size="small" />
          ))
        }
      />
      <NumberField source="view_count" />
      <DateField source="published_at" />
      <DateField source="created_at" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
)

export const BlogEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" required fullWidth />
      <TextInput source="slug" required fullWidth />
      <SelectInput 
        source="content_type" 
        choices={[
          { id: 'markdown', name: 'Markdown' },
          { id: 'html', name: 'HTML' }
        ]}
        defaultValue="markdown"
      />
      <RichTextInput 
        source="content" 
        label="Content"
        toolbar={[
          'undo', 'redo',
          'bold', 'italic', 'underline', 
          'link', 'unlink',
          'bulletedList', 'numberedList',
          'blockQuote', 'code', 'codeBlock',
          'heading', '|',
          'outdent', 'indent', '|',
          'insertTable', 'tableColumn', 'tableRow', 'mergeTableCells'
        ]}
        helperText="Rich text editor for HTML content. For Markdown, switch content type."
      />
      <TextInput source="excerpt" multiline rows={3} fullWidth helperText="Auto-generated if left empty" />
      <TextInput source="meta_title" fullWidth helperText="SEO title (defaults to title)" />
      <TextInput source="meta_description" multiline rows={2} fullWidth helperText="SEO description" />
      <ArrayInput source="tags">
        <SimpleFormIterator>
          <TextInput source="" label="Tag" />
        </SimpleFormIterator>
      </ArrayInput>
      <BooleanInput source="is_published" />
      <BooleanInput source="is_featured" />
    </SimpleForm>
  </Edit>
)

export const BlogCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" required fullWidth />
      <TextInput source="slug" fullWidth helperText="Auto-generated from title if left empty" />
      <SelectInput 
        source="content_type" 
        choices={[
          { id: 'markdown', name: 'Markdown' },
          { id: 'html', name: 'HTML' }
        ]}
        defaultValue="markdown"
      />
      <RichTextInput 
        source="content" 
        label="Content"
        toolbar={[
          'undo', 'redo',
          'bold', 'italic', 'underline', 
          'link', 'unlink',
          'bulletedList', 'numberedList',
          'blockQuote', 'code', 'codeBlock',
          'heading', '|',
          'outdent', 'indent', '|',
          'insertTable', 'tableColumn', 'tableRow', 'mergeTableCells'
        ]}
        helperText="Rich text editor for HTML content. For Markdown, switch content type."
      />
      <TextInput source="excerpt" multiline rows={3} fullWidth helperText="Auto-generated if left empty" />
      <TextInput source="meta_title" fullWidth helperText="SEO title (defaults to title)" />
      <TextInput source="meta_description" multiline rows={2} fullWidth helperText="SEO description" />
      <ArrayInput source="tags">
        <SimpleFormIterator>
          <TextInput source="" label="Tag" />
        </SimpleFormIterator>
      </ArrayInput>
      <BooleanInput source="is_published" defaultValue={false} />
      <BooleanInput source="is_featured" defaultValue={false} />
    </SimpleForm>
  </Create>
)

export const BlogShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="slug" />
      <TextField source="content_type" />
      <RichTextField source="processed_content" />
      <TextField source="excerpt" />
      <TextField source="meta_title" />
      <TextField source="meta_description" />
      <FunctionField 
        label="Tags"
        render={(record: { tags?: string[] }) => record.tags?.join(', ') || 'No tags'}
      />
      <BooleanField source="is_published" />
      <BooleanField source="is_featured" />
      <NumberField source="view_count" />
      <DateField source="published_at" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
      <ReferenceField source="author_id" reference="users" />
    </SimpleShowLayout>
  </Show>
)