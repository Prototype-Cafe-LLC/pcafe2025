# features

Framework: Django + NextJS SPA
CSS: CSS Modules
Component: Radix
database: Postgresql
PC/Mobile support
LLMs.txtサポート

Pages:

- landing page
- About Us
- Access
- Contact
- Engineering Community Space
- Current Office (IoT sensor chart)
- Niigata Events
- (login required) copy page image to event data extraction AI feature - data can be posted with event CRUD API

## API

- IoT Data post API  (django implementation reference: ref/prototype-cafe/sanjyo_tsubame_calendar)
  to be implemented in nextjs API layer
- sanjo-tsubame calendar API (django implementation reference: ref/prototype-cafe/sanjyo_tsubame_calendar)
  to be implemented in nextjs API layer
- event CRUD

## Deploy

Ansible

- build frontend
- deploy backend
