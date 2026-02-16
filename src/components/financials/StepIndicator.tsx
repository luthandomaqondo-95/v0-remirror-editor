'use client';

import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { ButtonGroup } from '../ui/button-group';

interface StepIndicatorProps {
    variant?: 'progress' | 'dropdown';
    className?: string;
    currentStep: number;
    totalSteps: number;
    steps: string[];
    onStepClick?: (step: number) => void;
    onPrevClick?: () => void;
    onNextClick?: () => void;
}
const StepIndicator: React.FC<StepIndicatorProps> = ({ variant = 'progress', className, currentStep, totalSteps, steps, onStepClick, onPrevClick, onNextClick }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={cn('w-full min-w-0 rounded-md flex items-center justify-between gap-1.5 sm:gap-2 mb-2', className)}>
            <ButtonGroup className="w-full min-w-0 flex-1 flex items-center justify-between gap-1.5 sm:gap-2">
                <Button variant="outline" size="icon" disabled={currentStep === 0} className={cn('shrink-0 h-9 w-9 sm:h-9 sm:w-9 md:w-auto md:px-3 cursor-pointer', variant === 'dropdown' ? 'rounded-md' : 'rounded-full -mt-1')} onClick={onPrevClick}>
                    <ChevronLeft className="h-4 w-4 md:hidden" />
                    <span className="hidden md:inline">Prev</span>
                </Button>
                <div className="relative min-w-0 flex-1 flex justify-center">
                    {
                        variant === 'dropdown' ? (
                            <div className="relative flex justify-center min-w-0 w-full max-w-full">
                                <DropdownMenu open={open} onOpenChange={setOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-9 px-2.5 sm:px-3 w-full cursor-pointer gap-1.5 sm:gap-2 text-sm">
                                            <span className="shrink-0 font-medium">{currentStep + 1}/{totalSteps}</span>
                                            <span className="min-w-0 truncate text-muted-foreground max-w-[85px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-[220px] xl:max-w-none">{steps[currentStep]}</span>
                                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 cursor-pointer" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="max-h-[min(70vh,400px)] overflow-y-auto">
                                        {steps.map((stepName, index) => (
                                            <DropdownMenuItem key={index} onClick={() => onStepClick?.(index)} className="cursor-pointer">
                                                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 shrink-0 mr-2', index < currentStep ? 'bg-orange-500 border-orange-500 text-white' : index === currentStep ? 'bg-white dark:bg-gray-800 border-orange-500 text-orange-500' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600')}>
                                                    {index < currentStep ? <Check className="h-4 w-4 text-white" /> : <span className="text-xs">{index + 1}</span>}
                                                </div>
                                                <span className="truncate">{stepName}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <>
                                <Progress value={(currentStep / (totalSteps - 1)) * 100} className="h-7 sm:h-8 rounded-full w-full" />
                                <div className="flex justify-between absolute top-6 sm:top-6 w-full transform -translate-y-1/2 px-1.5 sm:p-2 overflow-x-auto">
                                    {steps.map((stepName, index) => (
                                        <div key={index} className="flex flex-col items-center shrink-0 min-w-0">
                                            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 cursor-pointer', index < currentStep ? 'bg-orange-500 border-orange-500 text-white' : index === currentStep ? 'bg-white dark:bg-gray-800 border-orange-500 text-orange-500' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400')} onClick={() => onStepClick?.(index)}>
                                                {index < currentStep ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <span className="text-xs">{index + 1}</span>}
                                            </div>
                                            <span className={cn('text-[10px] sm:text-[10px] mt-1 text-center max-w-[55px] sm:max-w-[70px] md:max-w-[100px] lg:max-w-[140px] xl:max-w-none truncate', index === currentStep ? 'font-medium text-primary' : '')}>
                                                {stepName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )
                    }
                </div>
                <Button variant="default" size="icon" disabled={currentStep === totalSteps - 1} className={cn('shrink-0 h-9 w-9 md:w-auto md:px-3 cursor-pointer', variant === 'dropdown' ? 'rounded-md' : 'rounded-full -mt-1')} onClick={onNextClick}>
                    <ChevronRight className="h-4 w-4 md:hidden" />
                    <span className="hidden md:inline">Next</span>
                </Button>
            </ButtonGroup>
        </div>
    );
};

export default StepIndicator;