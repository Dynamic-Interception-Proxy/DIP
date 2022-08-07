import setCookie from 'set-cookie-parser';
import CookieParse from 'cookie';
import * as idb from 'idb';

function validateCookie(cookie, url, js = false) {
    if (cookie.httpOnly && !!js) return false;

    if (cookie.domain) if (cookie.domain.startsWith('.')) {
        if (!url.hostname.endsWith(cookie.domain.slice(1))) return false;
        return true;
    };

    if (cookie.domain !== url.hostname) return false;
    if (cookie.secure && url.protocol === 'http:') return false;
    if (!url.pathname.startsWith(cookie.path)) return false;

    return true;
};

async function db(openDB = idb.openDB) {
    const db = await openDB('__dip', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            const store = db.createObjectStore('cookies', {
                keyPath: 'id',
            });
            store.createIndex('path', 'path');
        },
    });
    db.transaction(['cookies'], 'readwrite').store.index('path');
    return db;
};


function serialize(cookies = [], url, js) {
    let str = '';
    for (const cookie of cookies) {
        if (!validateCookie(cookie, url, js)) continue;
        if (str.length) str += '; ';
        str += cookie.name;
        str += '='
        str += cookie.value;
    }; 
    return str;
};

async function getCookies(db) {
    const now = new Date();
    return (await db.getAll('cookies')).filter(cookie => {
        
        let expired = false;
        if (cookie.set) {
            if (cookie.maxAge) {
                expired = (cookie.set.getTime() + (cookie.maxAge * 1e3)) < now;
            } else if (cookie.expires) {
                expired = new Date(cookie.expires.toLocaleString()) < now;
            };
        };

        if (expired) {
            db.delete('cookies', cookie.id);
            return false;
        };

        return  true;
    });
};

function setCookies(data, db, url) {
    if (!db) return false;

    const cookies = setCookie(data, {
        decodeValues: false,
    })
    
    for (const cookie of cookies) {
        if (!cookie.domain) cookie.domain = '.' +url.hostname;
        if (!cookie.path) cookie.path = '/';

        if (!cookie.domain.startsWith('.')) {
            cookie.domain = '.' + cookie.domain;
        };

        db.put('cookies', {
            ...cookie, 
            id: `${cookie.domain}@${cookie.path}@${cookie.name}`,
            set: new Date(Date.now()),
        });
    };
    return true;
};

export { validateCookie, getCookies, setCookies, db , serialize, idb };