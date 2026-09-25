import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, User, Users, MapPin } from "lucide-react";
import type { UserGender } from "@/types";

interface PremiumFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGender?: UserGender;
  currentPreferredGender?: UserGender | null;
  currentPreferredRegions?: string[] | null;
  onSave: (filters: {
    gender?: UserGender;
    preferredGender?: UserGender | null;
    preferredRegions?: string[] | null;
  }) => void;
  isPending?: boolean;
}

// Full worldwide country list for region filtering (ISO 3166-1 alpha-2).
const COUNTRY_CODES = [
  'AF','AL','DZ','AD','AO','AG','AR','AM','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BT',
  'BO','BA','BW','BR','BN','BG','BF','BI','KH','CM','CA','CV','CF','TD','CL','CN','CO','KM','CG','CD',
  'CR','CI','HR','CU','CY','CZ','DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FJ','FI',
  'FR','GA','GM','GE','DE','GH','GR','GD','GT','GN','GW','GY','HT','HN','HU','IS','IN','ID','IR','IQ',
  'IE','IL','IT','JM','JP','JO','KZ','KE','KI','KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU',
  'MG','MW','MY','MV','ML','MT','MH','MR','MU','MX','FM','MD','MC','MN','ME','MA','MZ','MM','NA','NR',
  'NP','NL','NZ','NI','NE','NG','KP','MK','NO','OM','PK','PW','PS','PA','PG','PY','PE','PH','PL','PT',
  'QA','RO','RU','RW','KN','LC','VC','WS','SM','ST','SA','SN','RS','SC','SL','SG','SK','SI','SB','SO',
  'ZA','KR','SS','ES','LK','SD','SR','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TO','TT','TN','TR',
  'TM','TV','UG','UA','AE','GB','US','UY','UZ','VU','VA','VE','VN','YE','ZM','ZW',
];

const countryName = (() => {
  try {
    const dn = new Intl.DisplayNames(undefined, { type: 'region' });
    return (code: string) => dn.of(code) ?? code;
  } catch {
    return (code: string) => code;
  }
})();

const flagOf = (code: string) =>
  String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));

const AVAILABLE_REGIONS = COUNTRY_CODES.map((code) => ({
  code,
  name: countryName(code),
  flag: flagOf(code),
})).sort((a, b) => a.name.localeCompare(b.name));

export const PremiumFiltersModal = ({
  open,
  onOpenChange,
  currentGender = 'prefer_not_to_say',
  currentPreferredGender,
  currentPreferredRegions,
  onSave,
  isPending = false,
}: PremiumFiltersModalProps) => {
  const { t } = useTranslation();
  const [gender, setGender] = useState<UserGender>(currentGender);
  const [preferredGender, setPreferredGender] = useState<UserGender | null>(
    currentPreferredGender ?? null
  );
  const [preferredRegions, setPreferredRegions] = useState<string[]>(
    currentPreferredRegions ?? []
  );

  const handleSave = () => {
    onSave({
      gender,
      preferredGender: preferredGender,
      preferredRegions: preferredRegions.length > 0 ? preferredRegions : null,
    });
  };

  const toggleRegion = (code: string) => {
    setPreferredRegions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const genderOptions: { value: UserGender; labelKey: string; icon: string }[] = [
    { value: 'male', labelKey: 'premiumFilters.male', icon: '👨' },
    { value: 'female', labelKey: 'premiumFilters.female', icon: '👩' },
    { value: 'other', labelKey: 'premiumFilters.other', icon: '🧑' },
    { value: 'prefer_not_to_say', labelKey: 'premiumFilters.preferNotToSay', icon: '🤐' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            {t('premiumFilters.title')}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            {t('premiumFilters.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Your Gender Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('premiumFilters.yourGender')}
              </Label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('premiumFilters.helpMatch')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGender(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    gender === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t(option.labelKey)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Gender Filter */}
          <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('premiumFilters.genderPreference')}
              </Label>
              <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                {t('premiumFilters.premium')}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('premiumFilters.filterByGender')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPreferredGender(null)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  preferredGender === null
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌍</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('premiumFilters.noPreference')}
                  </span>
                </div>
              </button>
              {genderOptions.slice(0, 3).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPreferredGender(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    preferredGender === option.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t(option.labelKey)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Region Filter */}
          <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('premiumFilters.regionPreference')}
              </Label>
              <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                {t('premiumFilters.premium')}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('premiumFilters.selectCountries')}
            </p>
            {preferredRegions.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {t('premiumFilters.selectedCount', { count: preferredRegions.length })}
                </span>
                {preferredRegions.map((code) => {
                  const region = AVAILABLE_REGIONS.find((r) => r.code === code);
                  return region ? (
                    <Badge
                      key={code}
                      className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    >
                      {region.flag} {region.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
              {AVAILABLE_REGIONS.map((region) => (
                <button
                  key={region.code}
                  onClick={() => toggleRegion(region.code)}
                  className={`p-2 rounded-lg border transition-all text-left ${
                    preferredRegions.includes(region.code)
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{region.flag}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {region.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
              disabled={isPending}
            >
              {t('premiumFilters.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              disabled={isPending}
            >
              {isPending ? t('premiumFilters.saving') : t('premiumFilters.saveFilters')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
