"use client";

type ReqForm = {
  id: string;
  status: string;
  pet: {
    name: string;
    images: string[];
    status: string;
    id: string;
    animalType: string;
  };
};

const FORM_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    emoji: string;
    pill: string;
    stripe: string;
    glow: string;
    msg: string;
  }
> = {
  PENDING: {
    label: "Хүлээгдэж байна",
    emoji: "⏳",
    pill: "bg-amber-100 border-amber-300 text-amber-700",
    stripe: "bg-amber-400",
    glow: "hover:border-amber-300",
    msg: "Таны хүсэлтэд хараахан хариу илгээгээгүй байна.",
  },
  APPROVED: {
    label: "Зөвшөөрсөн",
    emoji: "✅",
    pill: "bg-green-100 border-green-300 text-green-700",
    stripe: "bg-green-400",
    glow: "hover:border-green-300",
    msg: "Баяр хүргэе! Таны хүсэлт зөвшөөрөгдлөө. Эзэнтэй холбогдоорой.",
  },
  REJECTED: {
    label: "Татгалзсан",
    emoji: "❌",
    pill: "bg-red-100 border-red-300 text-red-600",
    stripe: "bg-red-400",
    glow: "hover:border-red-300",
    msg: "Энэ удаа хүсэлт зөвшөөрөгдсөнгүй. Өөр амьтдыг үзнэ үү.",
  },
};

const REQ_FILTERS: { key: string | null; label: string; emoji: string }[] = [
  { key: null, label: "Бүгд", emoji: "🐾" },
  { key: "PENDING", label: "Хүлээгдэж байна", emoji: "⏳" },
  { key: "APPROVED", label: "Зөвшөөрсөн", emoji: "✅" },
  { key: "REJECTED", label: "Татгалзсан", emoji: "❌" },
];

const FormReqSection = ({
  formReq,
  reqFilter,
  setReqFilter,
  onView,
}: {
  formReq: ReqForm[];
  reqFilter: string | null;
  setReqFilter: (v: string | null) => void;
  onView: (id: string) => void;
}) => {
  if (formReq.length === 0) return null;

  const filtered = formReq.filter(
    (f) => reqFilter === null || f.status === reqFilter,
  );

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1.5 h-8 rounded-full bg-sky-400" />
        <h2 className="text-xl font-black text-gray-800">
          🏡 Үрчлэх хүсэлтийн хариу
        </h2>
        <span className="ml-1 text-xs font-black px-2.5 py-1 rounded-full text-white bg-sky-400">
          {formReq.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5 p-1 bg-white rounded-2xl shadow-sm border border-gray-100 w-fit">
        {REQ_FILTERS.map(({ key, label, emoji }) => {
          const count =
            key === null
              ? formReq.length
              : formReq.filter((f) => f.status === key).length;
          const active = reqFilter === key;
          return (
            <button
              key={String(key)}
              type="button"
              onClick={() => setReqFilter(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-black transition-all
                ${
                  active
                    ? "bg-linear-to-r from-sky-400 to-blue-400 text-white shadow-md scale-105"
                    : "text-gray-400 hover:bg-sky-50 hover:text-sky-600"
                }`}
            >
              {emoji} {label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                  active
                    ? "bg-white/25 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border-2 border-gray-100">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-black text-gray-400">
            {reqFilter
              ? `"${FORM_STATUS_CONFIG[reqFilter]?.label}" хүсэлт байхгүй байна`
              : "Хүсэлт байхгүй байна"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((form) => {
            const cfg =
              FORM_STATUS_CONFIG[form.status] ?? FORM_STATUS_CONFIG["PENDING"];
            return (
              <div
                key={form.id}
                className={`bg-white rounded-3xl overflow-hidden shadow-sm border-2 border-transparent
                  ${cfg.glow} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className={`h-1.5 w-full ${cfg.stripe}`} />

                <div className="flex gap-3 p-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-amber-50 border border-amber-100">
                    {form.pet?.images?.[0] ? (
                      <img
                        src={form.pet.images[0]}
                        alt={form.pet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {form.pet?.animalType === "Dog" ? "🐕" : "🐱"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="font-black text-gray-800 text-sm leading-tight truncate">
                        {form.pet?.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {form.pet?.animalType === "Dog"
                          ? "🐕 Нохой"
                          : "🐱 Муур"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-black w-fit mt-2 ${cfg.pill}`}
                    >
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>
                </div>

                <div
                  className={`mx-4 mb-3 px-3 py-2 rounded-xl text-xs font-semibold leading-snug border ${cfg.pill}`}
                >
                  {cfg.msg}
                </div>

                <div className="px-4 pb-4">
                  <button
                    onClick={() => onView(form.id)}
                    className="w-full py-2.5 rounded-xl text-white text-xs font-black shadow-sm transition-all active:scale-95
                     bg-linear-to-r from-sky-400 to-blue-400 hover:from-sky-500 hover:to-blue-500"
                  >
                    Дэлгэрэнгүй харах →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FormReqSection;
