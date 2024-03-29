'use strict';

var react = require('react');

function toValue(query, name, dataType, initial) {
  const value = dataType === Array ? query.getAll(name) : query.get(name);

  if (dataType === Number && value) {
    return value.includes('.') ? parseFloat(value) : parseInt(value);
  } else if (dataType === Date && value) {
    return new Date(Date.parse(value));
  } else if (dataType === Boolean) {
    return value === 'true';
  }

  return value || initial;
}

function useQueryParams(name, dataType = String, transform) {
  let initial;

  if (typeof dataType !== 'function') {
    initial = dataType;

    if (Array.isArray(dataType)) {
      dataType = Array;
    } else if (typeof dataType === 'number') {
      dataType = Number;
    } else if (dataType instanceof Date) {
      dataType = Date;
    } else if (typeof dataType === 'string') {
      dataType = String;
    } else if (typeof dataType === 'boolean') {
      dataType = Boolean;
    }
  }

  if (typeof window !== 'undefined') {
    const query = new URLSearchParams(window.location.search);

    if (transform) {
      initial = transform(toValue(query, name, dataType, initial));
    } else {
      initial = toValue(query, name, dataType, initial);
    }
  }

  const [value, setValue] = react.useState(initial);
  react.useLayoutEffect(() => {
    function listener(evt) {
      const query = new URLSearchParams(evt.target.location.search);

      if (transform) {
        setValue(transform(toValue(query, name, dataType, initial)));
      } else {
        setValue(toValue(query, name, dataType, initial));
      }
    } // Add a listener to update the value on history / URL changes.


    window.addEventListener('popstate', listener); // Clean up the event listener on unmount.

    return () => window.removeEventListener('popstate', listener);
  }, [setValue]);
  return [value, react.useCallback((value, options = {}) => {
    const query = new URLSearchParams(window.location.search);
    let hasChanged;

    if (Array.isArray(value)) {
      const all = query.getAll(name);

      const areDifferent = (v, i) => v !== all[i];

      hasChanged = value.some(areDifferent) || value.length !== all.length;

      if (hasChanged) {
        const item = value.shift();

        if (item) {
          query.set(name, item);
        } else {
          query.delete(name);
        }

        for (const item of value) query.append(name, item);
      }
    } else {
      hasChanged = query.get(name) !== value;

      if (hasChanged && value) {
        query.set(name, value);
      } else if (hasChanged) {
        query.delete(name);
      }
    }

    if (hasChanged) {
      window.history.pushState(undefined, undefined, `?${query}`);

      if (options.update !== false) {
        const evt = new window.PopStateEvent('popstate', {
          target: window
        });
        window.dispatchEvent(evt);
      }
    }
  }, [])];
}

module.exports = useQueryParams;
