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
import { talho }      from './talho';
import { kraft }      from './kraft';
import { desconto }   from './desconto';
import { boutique }   from './boutique';
import { tech }       from './tech';
import { split }      from './split';
import { peixaria }   from './peixaria';
import { padaria }    from './padaria';
import { infantil }   from './infantil';
import { atacado }    from './atacado';
import { minimercado } from './minimercado';

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
  talho:     { label: 'Talho',      fn: talho     },
  kraft:     { label: 'Kraft',      fn: kraft     },
  desconto:  { label: 'Desconto',   fn: desconto  },
  boutique:  { label: 'Boutique',   fn: boutique  },
  tech:      { label: 'Tech',       fn: tech      },
  split:     { label: 'Split',      fn: split     },
  peixaria:  { label: 'Peixaria',   fn: peixaria  },
  padaria:   { label: 'Padaria',    fn: padaria   },
  infantil:  { label: 'Infantil',   fn: infantil  },
  atacado:   { label: 'Atacado',    fn: atacado   },
  minimercado: { label: 'Minimercado', fn: minimercado },
};

export function renderLabel(l: Label, sz: SizeKey, cfg: AppConfig): string {
  const model = MODELS[cfg.selModel] ?? MODELS.classico;
  return model.fn(l, sz, cfg);
}
