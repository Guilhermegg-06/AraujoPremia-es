import type { Raffle } from '../types/raffle';

type KitVisualProps = {
  raffle: Raffle;
};

export function KitVisual({ raffle }: KitVisualProps) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-black/5 bg-[linear-gradient(140deg,#f7fbf4_0%,#f0f5ee_42%,#eef1ea_100%)] p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.38)] sm:p-6">
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_55%)]" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Kit em destaque</p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-950">Premio da vez</h3>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
            Foto de referencia
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] bg-[#1d221d] p-4 shadow-inner">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-[#4b2d1c] px-4 py-5 text-center text-sm font-semibold text-amber-50 shadow-sm">
                Old Parr 12
              </div>
              <div className="rounded-[24px] bg-[#b9732f] px-4 py-5 text-center text-sm font-semibold text-amber-950 shadow-sm">
                Licor 43
              </div>
            </div>
            <div className="mt-3 rounded-[24px] bg-[#1d7a33] px-4 py-5 text-center text-sm font-semibold text-white shadow-sm">
              Caixa de Heineken
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="rounded-2xl bg-[#2459c2] px-2 py-4 text-center text-xs font-semibold text-white shadow-sm">
                  Red Bull
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Itens do kit</p>
            <div className="mt-4 space-y-2">
              {raffle.items.map((item) => (
                <div key={item} className="rounded-2xl bg-stone-50 px-3 py-3 text-sm font-semibold text-stone-800">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-500">
              Estruturei a apresentacao do kit agora e deixei o bloco pronto para receber a foto real assim que ela entrar no repositorio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
