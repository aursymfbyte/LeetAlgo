import { useEffect } from "react";

const SITE_TITLE = "力扣算法題解";

export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    document.title = pageTitle === "" ? SITE_TITLE : `${pageTitle}｜${SITE_TITLE}`;
  }, [pageTitle]);
}
