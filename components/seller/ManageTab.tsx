import React, { useState } from 'react';
import { Seller, Solution, SharedContent } from '../../types';
import { SellerContentManager } from './SellerContentManager';
import { SolutionEditorModal } from './SolutionEditorModal';
import { PlusIcon } from '../common/Icons';
import { HoldSolutionModal } from './HoldSolutionModal';

interface ManageTabProps {
    seller: Seller;
    onUpdateSolutions: (solutions: Solution[]) => void;
    onOpenCreator: (solution: Solution, shareItem?: SharedContent) => void;
    onActivateSolution: (solutionId: string) => void;
    onSetSolutionHold: (solutionId: string, startDate: string, endDate: string) => void;
    onCancelSolutionHold: (solutionId: string) => void;
    onToggleInvestmentStatus: (sellerId: string, status: boolean) => void;
}

export const ManageTab: React.FC<ManageTabProps> = (props) => {
    const { seller, onUpdateSolutions, onOpenCreator, onActivateSolution, onSetSolutionHold, onCancelSolutionHold, onToggleInvestmentStatus } = props;

    const [isSolutionEditorOpen, setSolutionEditorOpen] = useState(false);
    const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
    const [solutionToHold, setSolutionToHold] = useState<Solution | null>(null);

    const handleSolutionUpdate = (updatedSolution: Solution) => {
        const updatedSolutions = seller.solutions.map(s => s.id === updatedSolution.id ? updatedSolution : s);
        onUpdateSolutions(updatedSolutions);
    };

    const handleSolutionSave = (solutionData: Solution) => {
        // This logic is now handled in App.tsx to correctly apply fees
        onUpdateSolutions([solutionData]); // Pass it up as an array for App.tsx to process
        setSolutionEditorOpen(false);
        setEditingSolution(null);
    };

    const handleEditSolution = (solution: Solution) => {
        setEditingSolution(solution);
        setSolutionEditorOpen(true);
    };
    
    const getStatusChip = (solution: Solution) => {
        switch(solution.status) {
            case 'active':
                return <span className="text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full">Active</span>;
            case 'inactive':
                return <span className="text-xs font-bold text-yellow-700 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 px-2 py-1 rounded-full">Inactive - Payment Due</span>;
            case 'on_hold':
                return <span className="text-xs font-bold text-gray-700 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">On Hold</span>;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold">Content Management</h2>
                <button 
                    onClick={() => { setEditingSolution(null); setSolutionEditorOpen(true); }}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-[10px] hover:bg-brand-primary/70 transition-colors"
                >
                    <PlusIcon className="w-4 h-4"/>
                    <span>Add New Solution</span>
                </button>
            </div>
            
             <div className="p-4 bg-brand-card-light rounded-lg border border-brand-border">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-brand-accent">Open for Investment</h3>
                        <p className="text-sm text-gray-500">Make your profile visible to investors and enable the investment dashboard.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={seller.isOpenForInvestment}
                            onChange={(e) => onToggleInvestmentStatus(seller.id, e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-secondary"></div>
                    </label>
                </div>
            </div>

            {seller.solutions.map(solution => (
                <div key={solution.id}>
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                         <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{solution.name}</h3>
                            {getStatusChip(solution)}
                         </div>
                         <div className="flex items-center gap-3 text-sm">
                            {solution.status === 'inactive' && <button onClick={() => onActivateSolution(solution.id)} className="font-semibold text-green-600 hover:underline">Activate</button>}
                            {solution.status === 'active' && <button onClick={() => setSolutionToHold(solution)} className="font-semibold text-gray-500 hover:underline">Put on Hold</button>}
                            {solution.status === 'on_hold' && <button onClick={() => onCancelSolutionHold(solution.id)} className="font-semibold text-blue-500 hover:underline">Reactivate</button>}
                            <button onClick={() => handleEditSolution(solution)} className="font-semibold text-brand-primary hover:underline">Edit Solution</button>
                         </div>
                    </div>
                    <SellerContentManager
                        solution={solution}
                        onUpdate={handleSolutionUpdate}
                        onShare={(item) => onOpenCreator(solution, item)}
                    />
                </div>
            ))}

            {isSolutionEditorOpen && (
                <SolutionEditorModal 
                    solution={editingSolution}
                    onClose={() => { setSolutionEditorOpen(false); setEditingSolution(null); }}
                    onSave={(data) => handleSolutionSave(data)}
                />
            )}

            {solutionToHold && (
                <HoldSolutionModal
                    solution={solutionToHold}
                    onClose={() => setSolutionToHold(null)}
                    onSave={(solutionId, start, end) => {
                        onSetSolutionHold(solutionId, start, end);
                        setSolutionToHold(null);
                    }}
                />
            )}
        </div>
    );
};