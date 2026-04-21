/** @param {Record<string, unknown> | undefined} row */
export function serializeStoreSettingsRow(row) {
  const r = row || {};
  return {
    contactAddressEn: r.contact_address_en ?? "",
    contactAddressBn: r.contact_address_bn ?? "",
    contactPhone: r.contact_phone ?? "",
    contactEmail: r.contact_email ?? "",
    businessHoursEn: r.business_hours_en ?? "",
    businessHoursBn: r.business_hours_bn ?? "",
    socialFacebookUrl: r.social_facebook_url ?? "",
    socialInstagramUrl: r.social_instagram_url ?? "",
    socialYoutubeUrl: r.social_youtube_url ?? "",
    socialOtherUrl: r.social_other_url ?? "",
    mapEmbedUrl: r.map_embed_url ?? "",
    mapExternalUrl: r.map_external_url ?? "",
    whatsappDigits: r.whatsapp_digits ?? "",
    whatsappPrefill: r.whatsapp_prefill ?? "",
    messengerUrl: r.messenger_url ?? "",
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
  };
}
