import Cookies from 'js-cookie';

/**
 * Set a cookie with the given name, value, and options
 */
export const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes) => {
    Cookies.set(name, value, {
        expires: 7, // Default to 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        ...options,
    });
};

/**
 * Retrieve a cookie by its name
 */
export const getCookie = (name: string): string | undefined => {
    return Cookies.get(name);
};

/**
 * Remove a cookie by its name
 */
export const removeCookie = (name: string, options?: Cookies.CookieAttributes) => {
    Cookies.remove(name, {
        ...options,
    });
};
