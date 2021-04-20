import { createLogger } from '@generates/logger';
import compose from 'koa-compose';

const logger = createLogger({ level: 'info', namespace: 'plug' });
const noOp = () => {};

async function plug (config = {}) {
  const phases = {};

  function register (phase, fn, index = phases[phase]?.items?.length) {
    if (!config.phases?.includes(phase)) {
      throw new Error(`Unknown plugin phase: ${phase}`)
    }

    if (!fn.name) throw new Error('Plugin function must have a name')

    logger.debug('Registering plugin:', { phase, name: fn.name });

    if (phases[phase]) {
      // Add plugin function to list of plugins for the phase.
      if (phases[phase].items) {
        phases[phase].items.splice(index, 0, fn);
      } else {
        phases[phase].items = [fn];
      }

      // Add any plugins that were registered to come after the current plugin.
      if (phases[phase].after && phases[phase].after[fn.name]) {
        phases[phase].items.push(...phases[phase].after[fn.name]);
      }

      // Compose the plugin functions into a middleware entry function.
      phases[phase].entry = compose(phases[phase].items);
    } else {
      phases[phase] = { items: [fn], entry: compose([fn]) };
    }
  }

  const context = {
    ...config,
    logger,
    in (phase, fn) {
      register(phase, fn);
    },
    before (name, phase, fn) {
      // If the child plugin has already been added, go ahead and add this
      // incoming plugin before it, otherwise the plugin will just be added to
      // end of the array and the child plugin will be added after it anyway
      // (there is an edge case that breaks this but the workaround is fine).
      const child = phases[phase]?.items?.findIndex(i => i.name === name);
      register(phase, fn, child !== undefined ? Math.max(child - 1, 0) : child);
    },
    after (name, phase, fn) {
      const parent = phases[phase]?.items?.findIndex(i => i.name === name);
      if (parent) {
        // If the parent plugin has already been added, go ahead and add this
        // incoming plugin after it.
        register(phase, fn, parent + 1);
      } else {
        // If the parent plugin hasn't been added yet, add this incoming plugin
        // to a list of plugins that will come after the parent plugin when it's
        // added.
        if (phases[phase]?.after) {
          if (phase[phase].after[name]) {
            phase[phase].after[name].push(fn);
          } else {
            phase[phase].after[name] = [fn];
          }
        } else if (phases[phase]) {
          phases[phase].after = { [name]: [fn] };
        } else {
          phases[phase] = { after: { [name]: [fn] } };
        }
      }
    }
  };

  // Initialize the array of plugins with any plugins passed in config.
  let plugins = config.plugins || [];

  // Load any plugins specified from JS files.
  if (config.files) {
    plugins = plugins.concat(await Promise.all(config.files.map(async file => {
      const plugin = await import(file);
      return plugin.default
    })));
  }

  // Allow plugins to register themselves.
  await Promise.all(plugins.map(plugin => plugin(context)));

  // Return a function to execute a phase.
  return function execute (phase, ctx, next = noOp) {
    if (phases[phase]) return phases[phase].entry(ctx, next)
  }
}

export default plug;
