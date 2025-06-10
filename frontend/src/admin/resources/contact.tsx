import { 
  List, 
  Datagrid, 
  TextField, 
  EmailField,
  DateField, 
  BooleanField, 
  Show, 
  SimpleShowLayout, 
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  SelectInput,
  Filter,
  ChipField,
  FunctionField
} from 'react-admin'

// Status color mapping
const statusColors: Record<string, string> = {
  new: '#f44336',      // red
  read: '#ff9800',     // orange
  responded: '#2196f3', // blue
  closed: '#4caf50'    // green
}

// Filter component for contact submissions
const ContactFilter = (props: Record<string, unknown>) => (
  <Filter {...props}>
    <SelectInput 
      label="Status" 
      source="status" 
      choices={[
        { id: 'new', name: 'New' },
        { id: 'read', name: 'Read' },
        { id: 'responded', name: 'Responded' },
        { id: 'closed', name: 'Closed' }
      ]}
    />
    <SelectInput 
      label="Form Type" 
      source="form_type" 
      choices={[
        { id: 'general', name: 'General' },
        { id: 'tour_request', name: 'Tour Request' },
        { id: 'partnership', name: 'Partnership' }
      ]}
    />
    <BooleanInput label="Is Spam" source="is_spam" />
    <BooleanInput label="Response Sent" source="response_sent" />
  </Filter>
)

// Contact Submissions List component
export const ContactList = (props: Record<string, unknown>) => (
  <List 
    {...props} 
    filters={<ContactFilter />}
    sort={{ field: 'created_at', order: 'DESC' }}
    perPage={25}
    title="Contact Form Submissions"
  >
    <Datagrid rowClick="show">
      <DateField source="created_at" showTime />
      <FunctionField
        label="Status"
        render={(record: { status: string }) => (
          <ChipField 
            source="status" 
            record={record}
            style={{ 
              backgroundColor: statusColors[record.status] || '#757575',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        )}
      />
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="subject" />
      <TextField source="form_type" />
      <BooleanField source="is_spam" />
      <BooleanField source="response_sent" />
      <BooleanField source="turnstile_verified" />
    </Datagrid>
  </List>
)

// Contact Submission Show component
export const ContactShow = (props: Record<string, unknown>) => (
  <Show {...props} title="Contact Submission Details">
    <SimpleShowLayout>
      <TextField source="id" />
      <DateField source="created_at" showTime />
      <DateField source="updated_at" showTime />
      
      <TextField source="status" />
      <BooleanField source="is_spam" />
      <TextField source="form_type" />
      
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="phone" />
      <TextField source="company" />
      
      <TextField source="subject" />
      <TextField source="message" multiline />
      
      <TextField source="source" />
      <TextField source="ip_address" />
      <TextField source="user_agent" />
      
      <BooleanField source="turnstile_verified" />
      <BooleanField source="response_sent" />
      <DateField source="response_sent_at" showTime />
      <DateField source="processed_at" showTime />
      
      <TextField source="admin_notes" multiline />
    </SimpleShowLayout>
  </Show>
)

// Contact Submission Edit component (for admin updates)
export const ContactEdit = (props: Record<string, unknown>) => (
  <Edit {...props} title="Update Contact Submission">
    <SimpleForm>
      <TextInput source="id" disabled />
      <DateField source="created_at" disabled />
      
      <SelectInput 
        source="status" 
        choices={[
          { id: 'new', name: 'New' },
          { id: 'read', name: 'Read' },
          { id: 'responded', name: 'Responded' },
          { id: 'closed', name: 'Closed' }
        ]}
      />
      
      <BooleanInput source="is_spam" />
      <BooleanInput source="response_sent" />
      
      <TextInput 
        source="admin_notes" 
        multiline 
        rows={4}
        fullWidth
        label="Admin Notes"
      />
      
      {/* Read-only fields for reference */}
      <TextInput source="name" disabled />
      <TextInput source="email" disabled />
      <TextInput source="phone" disabled />
      <TextInput source="company" disabled />
      <TextInput source="subject" disabled />
      <TextInput source="message" multiline rows={4} disabled />
    </SimpleForm>
  </Edit>
)