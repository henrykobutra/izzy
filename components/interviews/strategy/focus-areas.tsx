'use client';

import { FocusArea } from '@/types/strategy';

interface FocusAreasProps {
  focusAreas: FocusArea[];
}

export function FocusAreas({ focusAreas }: FocusAreasProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Interview Focus Areas</h3>
      <div className="space-y-2">
        {(focusAreas || []).map((area, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <p className="text-sm font-medium">
              {area.name} ({area.weight}%)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {area.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}