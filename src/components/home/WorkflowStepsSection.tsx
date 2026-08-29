import React from 'react';
import { MessageSquare, Cpu, FileUp, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';

export const WorkflowStepsSection: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      num: '01',
      icon: MessageSquare,
      title: t.home.workflowStep1Title,
      desc: t.home.workflowStep1Desc,
    },
    {
      num: '02',
      icon: Cpu,
      title: t.home.workflowStep2Title,
      desc: t.home.workflowStep2Desc,
    },
    {
      num: '03',
      icon: FileUp,
      title: t.home.workflowStep3Title,
      desc: t.home.workflowStep3Desc,
    },
    {
      num: '04',
      icon: CheckCircle,
      title: t.home.workflowStep4Title,
      desc: t.home.workflowStep4Desc,
    },
  ];

  return (
    <section aria-labelledby="workflow-heading" className="w-full space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-chakra-blue uppercase tracking-wider mb-1.5 block">
          {t.home.workflowSectionTitle}
        </span>
        <h2
          id="workflow-heading"
          className="text-xl sm:text-2xl font-bold tracking-tight text-deep-navy"
        >
          {t.home.workflowSectionSubtitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="relative flex flex-col rounded-lg border border-border-soft bg-white p-4 sm:p-5 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-mist text-chakra-blue">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-mono font-bold text-muted-text/60">
                  {step.num}
                </span>
              </div>
              <h3 className="text-sm font-bold text-deep-navy mb-1.5">
                {step.title}
              </h3>
              <p className="text-xs text-muted-text leading-relaxed">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
