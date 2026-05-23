import Cookies from 'js-cookie';
import {
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Presentation,
} from 'lucide-react';
import { PAGE_SIZE } from './mock-data';

export const setCookie = (name: string, value: string) => {
  Cookies.set(name, value);
};

export const getCookie = (name: string) => {
  return Cookies.get(name);
};

export const deleteCookie = (name: string) => {
  Cookies.remove(name);
};

/** Session cookie: cleared on logout; no max-age so it expires when the browser session ends. */
export const USER_SESSION_QUERY_PROMPT_COOKIE =
  'user-session-query-prompt-dismissed';

const APP_SESSION_COOKIES = [
  'user',
  'x-active-role',
  'access-token',
  'refresh-token',
  'auth-user',
  USER_SESSION_QUERY_PROMPT_COOKIE,
  'sidebar-nav-scroll-admin',
  'sidebar-nav-scroll-dashboard',
] as const;

export const resetCookies = () => {
  for (const name of APP_SESSION_COOKIES) {
    Cookies.remove(name, { path: '/' });
  }
};

export const removeCookie = (
  name: string,
  options: Cookies.CookieAttributes = {}
) => {
  Cookies.remove(name, options);
};

export const getFileType = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext!))
    return 'image';
  if (['pdf'].includes(ext!)) return 'pdf';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext!))
    return 'office';
  return 'unknown';
};

export const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext!))
    return <FileImage className="h-4 w-4 shrink-0 text-blue-500" />;

  if (['pdf'].includes(ext!))
    return <FileText className="h-4 w-4 shrink-0 text-red-500" />;

  if (['doc', 'docx'].includes(ext!))
    return <FileText className="h-4 w-4 shrink-0 text-blue-600" />;

  if (['xls', 'xlsx'].includes(ext!))
    return <FileSpreadsheet className="h-4 w-4 shrink-0 text-green-600" />;

  if (['ppt', 'pptx'].includes(ext!))
    return <Presentation className="h-4 w-4 shrink-0 text-orange-500" />;

  return <File className="h-4 w-4 shrink-0 text-muted-foreground" />;
};

export const calculateYearsOfExperience = (lawyerExp: string | null) => {
  if (!lawyerExp) return '-';
  const startDate = new Date(lawyerExp);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} days`;
  }

  if (Math.floor(diffDays / 365) == 0) {
    return `${Math.floor((diffDays % 365) / 30)} mo`;
  }
  return `${Math.floor(diffDays / 365)} yrs ${Math.floor((diffDays % 365) / 30)} mo`;
};

export const getFirstLetterCapitalized = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const buildGenericQueryParams = (page: number, limit?: number) => {
  const params: Record<string, string | number> = {
    page,
    limit: limit ?? PAGE_SIZE,
    orderBy: 'createdAt',
    order: 'DESC',
  };
  return params;
};

/** File input `accept` for case documents: any image type + PDF/Word */
export const CASE_DOCUMENT_ACCEPT = 'image/*,.pdf,.doc,.docx';
