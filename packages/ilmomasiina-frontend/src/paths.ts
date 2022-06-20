import { AdminEvent } from '@tietokilta/ilmomasiina-models/src/services/admin/events';
import { Event } from '@tietokilta/ilmomasiina-models/src/services/events';
import { Signup } from '@tietokilta/ilmomasiina-models/src/services/signups';

export const urlPrefix = PREFIX_URL;

const paths = {
  eventsList: `${urlPrefix}/`,
  eventDetails: (slug: Event.Slug) => `${urlPrefix}/events/${slug}`,
  editSignup: (id: Signup.Id, editToken: string) => `${urlPrefix}/signup/${id}/${editToken}`,

  adminLogin: `${urlPrefix}/login`,
  adminEventsList: `${urlPrefix}/admin`,
  adminEditEvent: (id: AdminEvent.Id) => `${urlPrefix}/admin/edit/${id}`,
  adminUsersList: `${urlPrefix}/admin/users`,
  adminAuditLog: `${urlPrefix}/admin/auditlog`,
};

export default paths;