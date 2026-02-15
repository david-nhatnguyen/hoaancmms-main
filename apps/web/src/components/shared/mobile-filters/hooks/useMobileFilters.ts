
import { useState, useCallback } from 'react';

export interface FilterSection {
    id: string;
    label: string;
    content: React.ReactNode;
    activeCount?: number;
}

export interface UseMobileFiltersProps {
    sections: FilterSection[];
    onClearAll?: () => void;
}

export interface UseMobileFiltersReturn {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    expandedSections: string[];
    toggleSection: (id: string) => void;
    handleClearAll: () => void;
}

export function useMobileFilters({
    sections,
    onClearAll
}: UseMobileFiltersProps): UseMobileFiltersReturn {
    const [isOpen, setIsOpen] = useState(false);
    
    // Initialize with all sections expanded by default for better visibility
    const [expandedSections, setExpandedSections] = useState<string[]>(
        sections.map(s => s.id)
    );

    const toggleSection = useCallback((id: string) => {
        setExpandedSections(prev =>
            prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id]
        );
    }, []);

    const handleClearAll = useCallback(() => {
        if (onClearAll) {
            onClearAll();
        }
        // Keep dialog open or close? Typically keep open to show results cleared.
    }, [onClearAll]);

    return {
        isOpen,
        setIsOpen,
        expandedSections,
        toggleSection,
        handleClearAll
    };
}
