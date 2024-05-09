# Changelog

This document contains the version history of Ilmomasiina.

## 2.0.0

**Visible features**:

- Interface is fully localized in Finnish and English
- Events can be created without a signup, and signups can be created with no event date
- Event descriptions support Markdown
- Name and email questions can be removed
- Users can choose whether their signup name is shown publicly
- Signups can be viewed even after editing closes
- Editable event slugs (instead of numeric IDs) in all user-visible URLs
- Unlisted events (hidden from event list, but can be signed up to)
- Admins can change their password and reset others' passwords
- iCalendar export of event list (can be imported to e.g. Google Calendar)
- Events have a category (can be filtered via API)
- Quotas and questions can be reordered after creating an event
- Admins are warned when changes to an event affect people already signed up
- Installation experience is documented and smoother than previously

**Major technical changes:**

- Entire project ported to TypeScript
- Frontend and backend split to multiple packages
- Backend ported to Fastify
- Frontend built using Vite
- NPM packages created for custom frontends/clients
- Project builds as Docker container automatically
- Dotenv support
- Significantly expanded documentation

**Other changes and fixes:**

- Error messages are actually useful
- "You got a spot from the queue" emails work consistently
- Refreshing/navigating away from a new signup or typoing the email address no longer make the signup unreachable
- Question options can contain semicolons
- Editor performance improved
- More thorough and configurable anonymization of old signups
- Sequential database IDs are no longer visible to users
- Deleted items are not stuck in the database forever
- Signup state (quota/queue and position) is more consistent
- Security vulnerabilities fixed
- Numerous other bug fixes and improvements
