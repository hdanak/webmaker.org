var util = module.exports = {
    loadSubmodules: function (path) {
        var exp = {},
            fs = require('fs');
        fs.readdirSync(path).filter(function (f) {
            return f.match(/^[a-zA-Z]/)
                && !f.match(/^index\.js$/)
                && (fs.statSync(path+'/'+f).isFile() ? f.match(/\.js$/) : true);
        }).forEach(function (f) {
            try {
                exp[util.camelize(f).replace(/\..*/, '')] = require(path+'/'+f);
            } catch (e) {}
        });
        return exp;
    },
    camelize:  function (x) {
        return x.toLowerCase().replace(/_?([^\W_]+)/g, function(m, m1) {
            return m1.charAt(0).toUpperCase() + m1.substr(1);
        }).replace(/\w+/g, function (m, m1) {
            return m.charAt(0).toUpperCase() + m.substr(1);
        });
    },

    /* Returns whether an object has values for the given list of keys. */
    hasFields: function (o, fields) {
        return o && fields.every(function (f) { return o[f] !== undefined });
    },

    /* Returns an object mapping the given fields to environment variables
     * whose keys are the capitalized name of each field prepended by an
     * optional prefix.
     *
     * For example:
     *    process.env
     *      => { PFX_FOO: 'bar', PFX_BAZ: 'garply', ... }
     *    getEnvConfig(['foo', 'baz'], 'PFX_')
     *      => { foo: 'bar', baz: 'garply' }
     */
    getEnvConfig: function (fields, prefix) {
        prefix = prefix || '';
        var conf = {};
        fields.forEach(function (f) {
            conf[f] = process.env[(prefix + f).toUpperCase()];
        });
        return conf
    },
    extend: function(obj, extra) {
        var clone = Object.create(obj);
        for (var k in extra)
            if (extra.hasOwnProperty(k))
                Object.defineProperty(clone, k, Object.getOwnPropertyDescriptor(extra, k));
            else
                clone[k] = extra[k];
        return clone;
    },

    /* Creates property `destKey` on object `dest`, whose value is dynamically
     * tied to the property `srcKey` (or if undefined, `destKey`) on `src`. */
    shortcut: function(dest, destKey, src, srcKey) {
        srcKey = srcKey || destKey;
        Object.defineProperty(dest, destKey, { get: function() { return src[srcKey] }});
    },

    /* Returns a function that, when called with an object, will return
     * a version of itself whose prototype is extended by the object. */
    autoconfig: function (defs) {
        function conf(opts) {
            return util.autoconfig(util.extend(conf, opts));
        }
        conf.__proto__ = util.extend(conf.__proto__, defs);
        return conf;
    },

    /* Returns a transformed version of the given object with each of its own
     * enumerable properties set to the return value of the mapper function
     * called with each (key, old_value). The original object is set as the
     * new object's prototype, hence retaining the original prototype chain. */
    mapObj: function (old, mapper) {
        var clone = Object.create(old);
        Object.keys(old).forEach(function(f) {
            clone[f] = mapper(f, old[f]);
        });
        return clone;
    },

    /* Returns an array of items from array `A` that are not in array `B`. */
    sans: function (A, B) {
        return A.filter(function(x) { return B.indexOf(x) < 0 });
    },

    /* Returns the first argument if defined, otherwise returns the second. */
    ifndef: function(x, d) {
        return x === undefined ? d : x
    }
}
