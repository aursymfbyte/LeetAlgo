import { useEffect } from "react";

const SITE_TITLE = "算法題解";

export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    document.title = pageTitle === "" ? SITE_TITLE : `${pageTitle}｜${SITE_TITLE}`;
  }, [pageTitle]);
}
