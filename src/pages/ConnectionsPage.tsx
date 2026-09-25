import React from "react";
import { useNavigate } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalConnectionInterface } from "@/components/GlobalConnectionInterface";
import { ParticleBackground } from "@/components/ParticleBackground";
import toast from "react-hot-toast";

export default function ConnectionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const closeFeature = () => {
    navigate("/");
  };

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen w-full overflow-x-hidden relative z-10">
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeFeature}
              className="text-white/90 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </div>
          <GlobalConnectionInterface
            closeFeature={closeFeature}
            onSendMessage={() => toast.success(t("common.messageSent"))}
          />
        </div>
      </div>
    </>
  );
}
