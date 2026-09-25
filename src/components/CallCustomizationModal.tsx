import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TAG_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "Love/Dating", labelKey: "callCustomization.tags.loveDating" },
  { value: "Tech", labelKey: "callCustomization.tags.tech" },
  { value: "Music", labelKey: "callCustomization.tags.music" },
  { value: "Business", labelKey: "callCustomization.tags.business" },
  { value: "Gaming", labelKey: "callCustomization.tags.gaming" },
  { value: "Sports", labelKey: "callCustomization.tags.sports" },
  { value: "Fitness", labelKey: "callCustomization.tags.fitness" },
  { value: "Art", labelKey: "callCustomization.tags.art" },
  { value: "Travel", labelKey: "callCustomization.tags.travel" },
  { value: "Faith", labelKey: "callCustomization.tags.faith" },
  { value: "Family", labelKey: "callCustomization.tags.family" },
  { value: "Movies", labelKey: "callCustomization.tags.movies" },
  { value: "Food", labelKey: "callCustomization.tags.food" },
  { value: "Books", labelKey: "callCustomization.tags.books" },
  { value: "Languages", labelKey: "callCustomization.tags.languages" },
  { value: "Crypto", labelKey: "callCustomization.tags.crypto" },
  { value: "Fashion", labelKey: "callCustomization.tags.fashion" },
  { value: "Science", labelKey: "callCustomization.tags.science" },
  { value: "Comedy", labelKey: "callCustomization.tags.comedy" },
  { value: "Mental health", labelKey: "callCustomization.tags.mentalHealth" },
];

interface CallCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTags: string[];
  onSave: (tags: string[]) => Promise<void> | void;
  isSaving?: boolean;
}

export const CallCustomizationModal = ({
  open,
  onOpenChange,
  selectedTags,
  onSave,
  isSaving = false,
}: CallCustomizationModalProps) => {
  const { t } = useTranslation();
  const [draftTags, setDraftTags] = useState<string[]>(selectedTags);

  useEffect(() => {
    if (open) {
      setDraftTags(selectedTags);
    }
  }, [open, selectedTags]);

  const hasTags = draftTags.length > 0;
  const sortedTags = useMemo(
    () => [...draftTags].sort((a, b) => a.localeCompare(b)),
    [draftTags]
  );

  const toggleTag = (tag: string) => {
    setDraftTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  const getTagLabel = (tagValue: string) => {
    const option = TAG_OPTIONS.find((o) => o.value === tagValue);
    return option ? t(option.labelKey, option.value) : tagValue;
  };

  const handleSave = async () => {
    await onSave(draftTags);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('callCustomization.title')}</DialogTitle>
          <DialogDescription>
            {t('callCustomization.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((option) => {
            const active = draftTags.includes(option.value);
            return (
              <Button
                key={option.value}
                type="button"
                variant={active ? "default" : "outline"}
                className={active ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                onClick={() => toggleTag(option.value)}
              >
                {t(option.labelKey, option.value)}
              </Button>
            );
          })}
        </div>

        <div className="rounded-xl border border-indigo-200/40 bg-indigo-50/50 p-3 text-sm text-indigo-900">
          {hasTags ? (
            <span>
              {t('callCustomization.selected')} <span className="font-semibold">{sortedTags.map(getTagLabel).join(", ")}</span>
            </span>
          ) : (
            <span>{t('callCustomization.selectOneInterest')}</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t('callCustomization.cancel')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('callCustomization.saving') : t('callCustomization.savePreferences')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

