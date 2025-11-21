import type { CheckInPhotoInputDto } from "@/models/booking";

type TripStageCardProps = {
  title: string;
  subtitle?: string;
  odometerLabel: string;
  notesLabel: string;
  notesPlaceholder?: string;
  form: { odometer: string; notes: string };
  onChange: (field: "odometer" | "notes", value: string) => void;
  photos: CheckInPhotoInputDto[];
  onFilesSelected: (files: FileList) => Promise<void>;
  onRemovePhoto: (index: number) => void;
  buttonLabel: string;
  onSubmit: () => void;
  disabled?: boolean;
  footerSlot?: React.ReactNode;
};

const TripStageCard = ({
  title,
  subtitle,
  odometerLabel,
  notesLabel,
  notesPlaceholder,
  form,
  onChange,
  photos,
  onFilesSelected,
  onRemovePhoto,
  buttonLabel,
  onSubmit,
  disabled,
  footerSlot,
}: TripStageCardProps) => {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#f5ebe0] p-4">
      <div>
        <p className="text-sm font-semibold text-black">{title}</p>
        {subtitle && <p className="text-xs text-black/70">{subtitle}</p>}
      </div>
      <label className="text-xs text-black">
        {odometerLabel}
        <input
          type="number"
          value={form.odometer}
          onChange={(event) => onChange("odometer", event.target.value)}
          className="mt-1 w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-3 py-2"
        />
      </label>
      <label className="text-xs text-black">
        {notesLabel}
        <textarea
          rows={3}
          value={form.notes}
          placeholder={notesPlaceholder}
          onChange={(event) => onChange("notes", event.target.value)}
          className="mt-1 w-full rounded-2xl border border-slate-800 bg-[#f5ebe0] px-3 py-2"
        />
      </label>
      <label className="text-xs text-black">
        Ảnh minh chứng
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={async (event) => {
            if (event.target.files) {
              await onFilesSelected(event.target.files);
            }
            event.currentTarget.value = "";
          }}
          className="mt-1 w-full text-sm text-black"
        />
      </label>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 text-xs text-black">
          {photos.map((photo, index) => (
            <div
              key={`${photo.photoUrl}-${index}`}
              className="rounded-2xl border border-slate-800 bg-[#f5ebe0] p-2"
            >
              <img
                src={photo.photoUrl}
                alt={photo.description ?? `Photo ${index + 1}`}
                className="h-24 w-full rounded object-cover"
              />
              <button
                type="button"
                className="mt-2 text-[10px] text-rose-500 underline"
                onClick={() => onRemovePhoto(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buttonLabel}
      </button>
      {footerSlot}
    </div>
  );
};

export default TripStageCard;
