(function(module) {
    function createUriRegex (optionalScheme) {
        /**
         * DIGIT = %x30-39 ; 0-9
         */
        var digit = '0-9',
            digitOnly = '[' + digit + ']';

        /**
         * ALPHA = %x41-5A / %x61-7A   ; A-Z / a-z
         */
        var alpha = 'a-zA-Z',
            alphaOnly = '[' + alpha + ']';

        /**
         * HEXDIG = DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
         */
        var hexDigit = digit + 'A-Fa-f',
            hexDigitOnly = '[' + hexDigit + ']';

        /**
         * unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
         */
        var unreserved = alpha + digit + '-\\._~';

        /**
         * pct-encoded = "%" HEXDIG HEXDIG
         */
        var pctEncoded = '%' + hexDigit;

        /**
         * sub-delims = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
         */
        var subDelims = '!\\$&\'\\(\\)\\*\\+,;=';

        /**
         * pchar = unreserved / pct-encoded / sub-delims / ":" / "@"
         */
        var pchar = unreserved + pctEncoded + subDelims + ':@',
            pcharOnly = '[' + pchar + ']';

        /**
         * elements separated by forward slash ("/") are alternatives.
         */
        var or = '|';

        /**
         * Rule to support zero-padded addresses.
         */
        var zeroPad = '0?';

        /**
         * dec-octet   = DIGIT                 ; 0-9
         *            / %x31-39 DIGIT         ; 10-99
         *            / "1" 2DIGIT            ; 100-199
         *            / "2" %x30-34 DIGIT     ; 200-249
         *            / "25" %x30-35          ; 250-255
         */
        var decOctect = '(' + zeroPad + zeroPad + digitOnly + or + zeroPad + '[1-9]' + digitOnly + or + '1' + digitOnly + digitOnly + or + '2' + '[0-4]' + digitOnly + or + '25' + '[0-5])';

        /**
         * scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
         */
        var scheme = alphaOnly + '[' + alpha + digit + '+-\\.]*';

        // If we were passed a scheme, use it instead of the generic one
        if (optionalScheme) {
            scheme = optionalScheme;
        }

        /**
         * userinfo = *( unreserved / pct-encoded / sub-delims / ":" )
         */
        var userinfo = '[' + unreserved + pctEncoded + subDelims + ':]*';

        /**
         * IPv4address = dec-octet "." dec-octet "." dec-octet "." dec-octet
         */
        var IPv4address = '(' + decOctect + '\\.){3}' + decOctect;

        /**
         * h16 = 1*4HEXDIG ; 16 bits of address represented in hexadecimal
         * ls32 = ( h16 ":" h16 ) / IPv4address ; least-significant 32 bits of address
         * IPv6address =                            6( h16 ":" ) ls32
         *             /                       "::" 5( h16 ":" ) ls32
         *             / [               h16 ] "::" 4( h16 ":" ) ls32
         *             / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
         *             / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
         *             / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
         *             / [ *4( h16 ":" ) h16 ] "::"              ls32
         *             / [ *5( h16 ":" ) h16 ] "::"              h16
         *             / [ *6( h16 ":" ) h16 ] "::"
         */
        var h16 = hexDigitOnly + '{1,4}',
            ls32 = '(' + h16 + ':' + h16 + '|' + IPv4address + ')',
            IPv6SixHex = '(' + h16 + ':){6}' + ls32,
            IPv6FiveHex = '::(' + h16 + ':){5}' + ls32,
            IPv6FourHex = h16 + '::(' + h16 + ':){4}' + ls32,
            IPv6ThreeeHex = '(' + h16 + ':){0,1}' + h16 + '::(' + h16 + ':){3}' + ls32,
            IPv6TwoHex = '(' + h16 + ':){0,2}' + h16 + '::(' + h16 + ':){2}' + ls32,
            IPv6OneHex = '(' + h16 + ':){0,3}' + h16 + '::' + h16 + ':' + ls32,
            IPv6NoneHex = '(' + h16 + ':){0,4}' + h16 + '::' + ls32,
            IPv6NoneHex2 = '(' + h16 + ':){0,5}' + h16 + '::' + h16,
            IPv6NoneHex3 = '(' + h16 + ':){0,6}' + h16 + '::',
            IPv6address = '(' + IPv6SixHex + or + IPv6FiveHex + or + IPv6FourHex + or + IPv6ThreeeHex + or + IPv6TwoHex + or + IPv6OneHex + or + IPv6NoneHex + or + IPv6NoneHex2 + or + IPv6NoneHex3 + ')';

        /**
         * IPvFuture = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )
         */
        var IPvFuture = 'v' + hexDigitOnly +'+\\.[' + unreserved + subDelims + ':]+';

        /**
         * IP-literal = "[" ( IPv6address / IPvFuture  ) "]"
         */
        var IPLiteral = '\\[(' + IPv6address + or + IPvFuture + ')\\]';

        /**
         * reg-name = *( unreserved / pct-encoded / sub-delims )
         */
        var regName = '[' + unreserved + pctEncoded + subDelims + ']{0,255}';

        /**
         * host = IP-literal / IPv4address / reg-name
         */
        var host = '(' + IPLiteral + or + IPv4address + or + regName + ')';

        /**
         * port = *DIGIT
         */
        var port = digitOnly + '*';

        /**
         * authority   = [ userinfo "@" ] host [ ":" port ]
         */
        var authority = '(' + userinfo + '@)?' + host + '(:' + port + ')?';

        /**
         * segment       = *pchar
         * segment-nz    = 1*pchar
         * path          = path-abempty    ; begins with "/" or is empty
         *               / path-absolute   ; begins with "/" but not "//"
         *               / path-noscheme   ; begins with a non-colon segment
         *               / path-rootless   ; begins with a segment
         *               / path-empty      ; zero characters
         * path-abempty  = *( "/" segment )
         * path-absolute = "/" [ segment-nz *( "/" segment ) ]
         * path-rootless = segment-nz *( "/" segment )
         */
        var segment = pcharOnly + '*',
            segmentNz = pcharOnly + '+',
            pathAbEmpty = '(\\/' + segment + ')*',
            pathAbsolute = '\\/(' + segmentNz + pathAbEmpty + ')?',
            pathRootless = segmentNz + pathAbEmpty;

        /**
         * hier-part = "//" authority path
         */
        var hierPart = '(\\/\\/' + authority + pathAbEmpty + or + pathAbsolute + or + pathRootless + ')';

        /**
         * query = *( pchar / "/" / "?" )
         */
        var query = '[' + pchar + '\\/\\?]*(?=#|$)'; //Finish matching either at the fragment part or end of the line.

        /**
         * fragment = *( pchar / "/" / "?" )
         */
        var fragment = '[' + pchar +'\\/\\?]*';

        /**
         * URI = scheme ":" hier-part [ "?" query ] [ "#" fragment ]
         */
        return new RegExp('^(' + scheme + '):(' + hierPart + ')(\\?' + query + ')?' + '(#' + fragment + ')?$');
    }

    function createUriRegexImproved (optionalScheme) {
        /**
         * DIGIT = %x30-39 ; 0-9
         */
        var digit = '0-9',
            digitOnly = '[' + digit + ']';

        /**
         * ALPHA = %x41-5A / %x61-7A   ; A-Z / a-z
         */
        var alpha = 'a-zA-Z',
            alphaOnly = '[' + alpha + ']';

        /**
         * HEXDIG = DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
         */
        var hexDigit = digit + 'A-Fa-f',
            hexDigitOnly = '[' + hexDigit + ']';

        /**
         * unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
         */
        var unreserved = alpha + digit + '-\\._~';

        /**
         * pct-encoded = "%" HEXDIG HEXDIG
         */
        var pctEncoded = '%' + hexDigit;

        /**
         * sub-delims = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
         */
        var subDelims = '!\\$&\'\\(\\)\\*\\+,;=';

        /**
         * pchar = unreserved / pct-encoded / sub-delims / ":" / "@"
         */
        var pchar = unreserved + pctEncoded + subDelims + ':@',
            pcharOnly = '[' + pchar + ']';

        /**
         * elements separated by forward slash ("/") are alternatives.
         */
        var or = '|';

        /**
         * Rule to support zero-padded addresses.
         */
        var zeroPad = '0?';

        /**
         * dec-octet   = DIGIT                 ; 0-9
         *            / %x31-39 DIGIT         ; 10-99
         *            / "1" 2DIGIT            ; 100-199
         *            / "2" %x30-34 DIGIT     ; 200-249
         *            / "25" %x30-35          ; 250-255
         */
        var decOctect = '(?:' + zeroPad + zeroPad + digitOnly + or + zeroPad + '[1-9]' + digitOnly + or + '1' + digitOnly + digitOnly + or + '2' + '[0-4]' + digitOnly + or + '25' + '[0-5])';

        /**
         * scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
         */
        var scheme = alphaOnly + '[' + alpha + digit + '+-\\.]*';

        // If we were passed a scheme, use it instead of the generic one
        if (optionalScheme) {
            // Have to put this in a non-capturing group to handle the OR statements
            scheme = '(?:' + optionalScheme + ')';
        }

        /**
         * userinfo = *( unreserved / pct-encoded / sub-delims / ":" )
         */
        var userinfo = '[' + unreserved + pctEncoded + subDelims + ':]*';

        /**
         * IPv4address = dec-octet "." dec-octet "." dec-octet "." dec-octet
         */
        var IPv4address = '(?:' + decOctect + '\\.){3}' + decOctect;

        /**
         * h16 = 1*4HEXDIG ; 16 bits of address represented in hexadecimal
         * ls32 = ( h16 ":" h16 ) / IPv4address ; least-significant 32 bits of address
         * IPv6address =                            6( h16 ":" ) ls32
         *             /                       "::" 5( h16 ":" ) ls32
         *             / [               h16 ] "::" 4( h16 ":" ) ls32
         *             / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
         *             / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
         *             / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
         *             / [ *4( h16 ":" ) h16 ] "::"              ls32
         *             / [ *5( h16 ":" ) h16 ] "::"              h16
         *             / [ *6( h16 ":" ) h16 ] "::"
         */
        var h16 = hexDigitOnly + '{1,4}',
            ls32 = '(?:' + h16 + ':' + h16 + '|' + IPv4address + ')',
            IPv6SixHex = '(?:' + h16 + ':){6}' + ls32,
            IPv6FiveHex = '::(?:' + h16 + ':){5}' + ls32,
            IPv6FourHex = h16 + '::(?:' + h16 + ':){4}' + ls32,
            IPv6ThreeeHex = '(?:' + h16 + ':){0,1}' + h16 + '::(?:' + h16 + ':){3}' + ls32,
            IPv6TwoHex = '(?:' + h16 + ':){0,2}' + h16 + '::(?:' + h16 + ':){2}' + ls32,
            IPv6OneHex = '(?:' + h16 + ':){0,3}' + h16 + '::' + h16 + ':' + ls32,
            IPv6NoneHex = '(?:' + h16 + ':){0,4}' + h16 + '::' + ls32,
            IPv6NoneHex2 = '(?:' + h16 + ':){0,5}' + h16 + '::' + h16,
            IPv6NoneHex3 = '(?:' + h16 + ':){0,6}' + h16 + '::',
            IPv6address = '(?:' + IPv6SixHex + or + IPv6FiveHex + or + IPv6FourHex + or + IPv6ThreeeHex + or + IPv6TwoHex + or + IPv6OneHex + or + IPv6NoneHex + or + IPv6NoneHex2 + or + IPv6NoneHex3 + ')';

        /**
         * IPvFuture = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )
         */
        var IPvFuture = 'v' + hexDigitOnly +'+\\.[' + unreserved + subDelims + ':]+';

        /**
         * IP-literal = "[" ( IPv6address / IPvFuture  ) "]"
         */
        var IPLiteral = '\\[(?:' + IPv6address + or + IPvFuture + ')\\]';

        /**
         * reg-name = *( unreserved / pct-encoded / sub-delims )
         */
        var regName = '[' + unreserved + pctEncoded + subDelims + ']{0,255}';

        /**
         * host = IP-literal / IPv4address / reg-name
         */
        var host = '(?:' + IPLiteral + or + IPv4address + or + regName + ')';

        /**
         * port = *DIGIT
         */
        var port = digitOnly + '*';

        /**
         * authority   = [ userinfo "@" ] host [ ":" port ]
         */
        var authority = '(?:' + userinfo + '@)?' + host + '(?::' + port + ')?';

        /**
         * segment       = *pchar
         * segment-nz    = 1*pchar
         * path          = path-abempty    ; begins with "/" or is empty
         *               / path-absolute   ; begins with "/" but not "//"
         *               / path-noscheme   ; begins with a non-colon segment
         *               / path-rootless   ; begins with a segment
         *               / path-empty      ; zero characters
         * path-abempty  = *( "/" segment )
         * path-absolute = "/" [ segment-nz *( "/" segment ) ]
         * path-rootless = segment-nz *( "/" segment )
         */
        var segment = pcharOnly + '*',
            segmentNz = pcharOnly + '+',
            pathAbEmpty = '(?:\\/' + segment + ')*',
            pathAbsolute = '\\/(?:' + segmentNz + pathAbEmpty + ')?',
            pathRootless = segmentNz + pathAbEmpty;

        /**
         * hier-part = "//" authority path
         */
        var hierPart = '(?:\\/\\/' + authority + pathAbEmpty + or + pathAbsolute + or + pathRootless + ')';

        /**
         * query = *( pchar / "/" / "?" )
         */
        var query = '[' + pchar + '\\/\\?]*(?=#|$)'; //Finish matching either at the fragment part or end of the line.

        /**
         * fragment = *( pchar / "/" / "?" )
         */
        var fragment = '[' + pchar +'\\/\\?]*';

        /**
         * URI = scheme ":" hier-part [ "?" query ] [ "#" fragment ]
         */
        return new RegExp('^' + scheme + ':' + hierPart + '(?:\\?' + query + ')?' + '(?:#' + fragment + ')?$');
    }

    module.exports = {
        createUriRegex: createUriRegex,
        createUriRegexImproved: createUriRegexImproved
    };
}(module));