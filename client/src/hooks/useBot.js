import { useMutation } from '@tanstack/react-query';
import { askHisabAssistantService } from '../services/botService';
export const useHisabAssistant = () => {
    return useMutation({
        mutationFn: askHisabAssistantService,
    });
};