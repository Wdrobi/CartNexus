import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function DocumentLang() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language?.startsWith("bn") ? "bn" : "en";
    document.documentElement.lang = lang;
  }, [i18n.language]);

  return null;
}
