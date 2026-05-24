/** PostHog funnel events */
export function trackEvent(name, props = {}) {
  if (typeof window !== "undefined" && window.posthog?.capture) {
    window.posthog.capture(name, props);
  }
}

export const AnalyticsEvents = {
  VIEW_PROPERTIES: "view_properties",
  VIEW_PROPERTY: "view_property",
  START_CHECKOUT: "start_checkout",
  COMPLETE_BOOKING: "complete_booking",
  CONTACT_SUBMIT: "contact_submit",
  OWNER_INQUIRY: "owner_inquiry",
  ADMIN_LOGIN: "admin_login",
};
