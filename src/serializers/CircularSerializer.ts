import {ISerializer} from './Serializer';

export class CircularSerializer implements ISerializer {
    public parse<T>(json: string): T {

        const obj = JSON.parse(json);
        return <T>JsonNetDecycle.retrocycle(obj);
    }

    public stringify<T>(object: T): string {
        return JSON.stringify(JsonNetDecycle.decycle(object));
    }
}

/* tslint:disable */

//https://bitbucket.org/smithkl42/jsonnetdecycle/src
//Douglass Crockford's circular JSON implemenation
//https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
//We may need to go back to Crockford's solution if JSON.net changes its reference style to be in line with  the IETF draft proposal

module JsonNetDecycle {

    function findReferences(obj: any, catalog: any): void {

        // The catalogObject function walks recursively through an object graph
        // looking for $id properties. When it finds an object with that property, then
        // it adds it to the catalog under that key.

        var i: number;
        if (obj && typeof obj === 'object') {
            var id: string = obj.$id;
            if (typeof id === 'string') {
                catalog[id] = obj;
            }

            if (Object.prototype.toString.apply(obj) === '[object Array]') {
                for (i = 0; i < obj.length; i += 1) {
                    findReferences(obj[i], catalog);
                }
            } else {
                for (let name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        if (typeof obj[name] === 'object') {
                            findReferences(obj[name], catalog);
                        }
                    }
                }
            }
        }
    }

    function resolveReferences(obj: any, catalog: any): any {
        var i: number, item: any, name: string, id: string;

        if (obj && typeof obj === 'object') {
            if (Object.prototype.toString.apply(obj) === '[object Array]') {
                for (i = 0; i < obj.length; i += 1) {
                    item = obj[i];
                    if (item && typeof item === 'object') {
                        id = item.$ref;
                        if (typeof id === 'string') {
                            obj[i] = catalog[id];
                        } else {
                            obj[i] = resolveReferences(item, catalog);
                        }
                    }
                }
            } else if (obj.$values && Object.prototype.toString.apply(obj.$values) === '[object Array]') {
                var arr = new Array();
                for (i = 0; i < obj.$values.length; i += 1) {
                    item = obj.$values[i];
                    if (item && typeof item === 'object') {
                        id = item.$ref;
                        if (typeof id === 'string') {
                            arr[i] = catalog[id];
                        } else {
                            arr[i] = resolveReferences(item, catalog);
                        }
                    } else {
                        arr[i] = item;
                    }
                }
                obj = arr;
            } else {
                for (name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        if (typeof obj[name] === 'object') {
                            item = obj[name];
                            if (item) {
                                id = item.$ref;
                                if (typeof id === 'string') {
                                    obj[name] = catalog[id];
                                } else {
                                    obj[name] = resolveReferences(item, catalog);
                                }
                            }
                        }
                    }
                }
            }
        }
        return obj;
    }

    function getDecycledCopy(obj: any, catalog: any): any {

        // The createReferences function recurses through the object, producing the deep copy.
        var i: number; // The loop counter
        var name: string; // Property name
        var nu: any; // The new object or array

        switch (typeof obj) {
            case 'object':

                // typeof null === 'object', so get out if this value is not really an object.
                // Also get out if it is a weird builtin object.

                if (obj === null ||
                    obj instanceof Boolean ||
                    obj instanceof Date ||
                    obj instanceof Number ||
                    obj instanceof RegExp ||
                    obj instanceof String) {
                    return obj;
                }

                // If the value is an object or array, look to see if we have already
                // encountered it. If so, return a {$id:id} object. This is a hard way, O(n)
                // linear search that will get slower as the number of unique objects grows.
                // JavaScript really should have a decent dictionary or map class.
                for (i = 0; i < catalog.length; i += 1) {
                    if (catalog[i] === obj) {
                        return { $ref: i.toString() };
                    }
                }

                // Otherwise, accumulate the unique value and its id.
                obj.$id = catalog.length.toString();
                catalog.push(obj);

                // If it is an array, replicate the array.
                if (Object.prototype.toString.apply(obj) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < obj.length; i += 1) {
                        nu[i] = getDecycledCopy(obj[i], catalog);
                    }
                } else {

                    // If it is an object, replicate the object.
                    nu = {};
                    for (name in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, name)) {
                            nu[name] = getDecycledCopy(obj[name], catalog);
                        }
                    }
                }
                return nu;
            case 'number':
            case 'string':
            case 'boolean':
            default:
                return obj;
        }
    }

    export function decycle<T>(obj: T): T {
        var catalog: any[] = [];   // Keep a reference to each unique object or array
        var newObj = getDecycledCopy(obj, catalog);
        return newObj;
    }

    export function retrocycle(obj: any): any {
        var catalog: any[] = [];
        findReferences(obj, catalog);
        return resolveReferences(obj, catalog);
    }
}