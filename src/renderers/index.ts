import type { Label } from '../types/label';
import type { AppConfig, ModelKey, SizeKey } from '../types/config';
import { classico }   from './classico';
import { premium }    from './premium';
import { minimal }    from './minimal';
import { promo }      from './promo';
import { eco }        from './eco';
import { retro }      from './retro';
import { neon }       from './neon';
import { corporate }  from './corporate';
import { bold }       from './bold';
import { farmacia }   from './farmacia';

export const MODELS: Record<ModelKey, { label: string; fn: (l: Label, sz: SizeKey, cfg: AppConfig) => string }> = {
  classico:  { label: 'Clássico',   fn: classico  },
  premium:   { label: 'Premium',    fn: premium   },
  minimal:   { label: 'Minimal',    fn: minimal   },
  promo:     { label: 'Promoção',   fn: promo     },
  eco:       { label: 'Eco',        fn: eco       },
  retro:     { label: 'Retro',      fn: retro     },
  neon:      { label: 'Neon',       fn: neon      },
  corporate: { label: 'Corporate',  fn: corporate },
  bold:      { label: 'Bold',       fn: bold      },
  farmacia:  { label: 'Farmácia',   fn: farmacia  },
};

export function renderLabel(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const model = MODELS[cfg.selModel] ?? MODELS.classico;
  return model.fn(l, sz, cfg);
}
