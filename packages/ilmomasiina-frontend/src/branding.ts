export type Branding = {
  headerTitle: string;
  footerGdprText: string;
  footerGdprLink: string;
  footerHomeText: string;
  footerHomeLink: string;
  loginPlaceholderEmail: string;
};

// The following strings can be changed here in code, or you can use Docker build args
// (or env variables) to change them at build time.

const branding: Branding = {
  headerTitle: BRANDING_HEADER_TITLE_TEXT,
  footerGdprText: BRANDING_FOOTER_GDPR_TEXT,
  footerGdprLink: BRANDING_FOOTER_GDPR_LINK,
  footerHomeText: BRANDING_FOOTER_HOME_TEXT,
  footerHomeLink: BRANDING_FOOTER_HOME_LINK,
  loginPlaceholderEmail: BRANDING_LOGIN_PLACEHOLDER_EMAIL,
};

export default branding;
