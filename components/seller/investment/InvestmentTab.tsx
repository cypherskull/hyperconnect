import React, { useState } from 'react';
import { Seller, FinancialStatementEntry, FundingRound, DueDiligenceData } from '../../../types';
import { TabButton } from '../../common/TabButton';
import { BarChart } from '../../common/BarChart';
import { PieChart } from '../../common/PieChart';
import { ProgressBar } from '../../common/ProgressBar';
import { ChartBarIcon, CurrencyDollarIcon, ShieldCheckIcon, UsersIcon, PencilIcon } from '../../common/Icons';
import { InvestmentDataEditorModal } from './InvestmentDataEditorModal';

type InvestmentSubTab = 'summary' | 'financials' | 'commercials' | 'funding' | 'risk';

const KpiCard: React.FC<{ title: string; value: string; benchmark: string; isPositive?: boolean }> = ({ title, value, benchmark, isPositive }) => (
    <div className="bg-brand-card-light p-4 rounded-lg border border-brand-border/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-brand-accent">{value}</p>
        <p className="text-xs text-gray-400">Benchmark: {benchmark}</p>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-brand-accent border-b-2 border-brand-secondary pb-2">{title}</h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const TimelineEvent: React.FC<{ round: FundingRound; isLast: boolean }> = ({ round, isLast }) => (
    <div className="flex items-start">
        <div className="flex flex-col items-center mr-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">{round.stage.charAt(0)}</div>
            {!isLast && <div className="w-px h-24 bg-brand-border"></div>}
        </div>
        <div className="bg-brand-card-light rounded-lg p-4 border border-brand-border/50 w-full">
            <p className="font-bold text-brand-primary">{round.stage} Round</p>
            <p className="text-sm text-gray-500">{new Date(round.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
            <div className="mt-2 text-xs grid grid-cols-2 gap-2">
                <div><strong>Amount:</strong> ${round.amountRaised.toLocaleString()}</div>
                <div><strong>Valuation:</strong> ${round.valuation.toLocaleString()}</div>
                <div className="col-span-2"><strong>Lead Investors:</strong> {round.leadInvestors.join(', ')}</div>
                <div><strong>Equity Diluted:</strong> {round.equityDiluted}%</div>
            </div>
        </div>
    </div>
);

interface InvestmentTabProps {
    seller: Seller;
    isOwner: boolean;
    onUpdateDueDiligence?: (sellerId: string, data: DueDiligenceData) => void;
}

const InvestmentTab: React.FC<InvestmentTabProps> = ({ seller, isOwner, onUpdateDueDiligence }) => {
    const [activeTab, setActiveTab] = useState<InvestmentSubTab>('summary');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const { dueDiligence } = seller;

    if (!dueDiligence) return <div>Data not available.</div>;
    
    const handleSave = (data: DueDiligenceData) => {
        if (onUpdateDueDiligence) {
            onUpdateDueDiligence(seller.id, data);
        }
        setIsEditorOpen(false);
    }

    const renderContent = () => {
        switch(activeTab) {
            case 'financials': return <FinancialsSection data={dueDiligence.financials} />;
            case 'commercials': return <CommercialsSection data={dueDiligence.commercials} />;
            case 'funding': return <FundingSection data={dueDiligence.funding} />;
            case 'risk': return <RiskLegalSection data={dueDiligence.riskAndLegal} />;
            case 'summary':
            default: return <ExecutiveSummary summary={dueDiligence.executiveSummary} />;
        }
    }

    return (
        <>
            <div className="bg-brand-card rounded-lg shadow-md border border-brand-border p-4 sm:p-6">
                <div className="flex justify-between items-start border-b border-brand-border mb-6">
                    <div className="flex space-x-2 overflow-x-auto pb-2 -mb-2">
                        <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} variant="solid">Summary</TabButton>
                        <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} variant="solid">Financials</TabButton>
                        <TabButton active={activeTab === 'commercials'} onClick={() => setActiveTab('commercials')} variant="solid">Commercial</TabButton>
                        <TabButton active={activeTab === 'funding'} onClick={() => setActiveTab('funding')} variant="solid">Funding</TabButton>
                        <TabButton active={activeTab === 'risk'} onClick={() => setActiveTab('risk')} variant="solid">Risk & Legal</TabButton>
                    </div>
                    {isOwner && onUpdateDueDiligence && (
                        <button onClick={() => setIsEditorOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-brand-secondary text-white rounded-md hover:bg-brand-secondary/80 whitespace-nowrap">
                            <PencilIcon className="w-4 h-4" />
                            Edit Data
                        </button>
                    )}
                </div>

                <div>
                    {renderContent()}
                </div>
            </div>
            {isEditorOpen && isOwner && (
                <InvestmentDataEditorModal
                    initialData={dueDiligence}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

const ExecutiveSummary: React.FC<{ summary: string }> = ({ summary }) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">Executive Summary & AI Recommendation</h3>
        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: summary }} />
    </div>
);

const FinancialsSection: React.FC<{ data: import('../../../types').FinancialsData }> = ({ data }) => {
    const revenueData = data.summary.map(item => ({ name: item.year.toString(), value: item.revenue, color: '#4D96FF' }));
    return (
        <div>
             <Section title="Key Financial Ratios">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.ratios.map(r => <KpiCard key={r.name} title={r.name} value={r.value} benchmark={r.benchmark} />)}
                </div>
            </Section>
            <Section title="Historical Performance">
                <BarChart data={revenueData.map(d => ({ ...d, tooltipData: { Revenue: `₹${(d.value / 10000000).toFixed(2)} Cr` } }))} />
            </Section>
            <Section title="Revenue & Cost Breakdown">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <PieChart data={data.revenueBreakdown} title="Revenue Mix" />
                    <PieChart data={data.costBreakdown} title="Cost Structure" />
                </div>
            </Section>
             <Section title="Financial Risks">
                <ul className="list-disc list-inside space-y-2 text-sm text-red-600 dark:text-red-400">
                    {data.risks.map(risk => <li key={risk.id}><strong>{risk.label}:</strong> {risk.value}</li>)}
                </ul>
            </Section>
        </div>
    );
};

const CommercialsSection: React.FC<{ data: import('../../../types').CommercialsData }> = ({ data }) => (
    <div>
        <Section title="Key Customer Metrics">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.customerMetrics.map(m => <KpiCard key={m.name} title={m.name} value={m.value} benchmark={m.benchmark} />)}
            </div>
        </Section>
        <Section title="Market Positioning">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-brand-card-light rounded-lg">
                    <p className="text-sm font-semibold text-gray-500">Market Share</p>
                    <p className="text-3xl font-bold">{data.marketShare}</p>
                </div>
                <div className="p-4 bg-brand-card-light rounded-lg">
                    <p className="text-sm font-semibold text-gray-500">Unique Value Proposition</p>
                    <p className="font-semibold mt-1">{data.uvp}</p>
                </div>
            </div>
        </Section>
        <Section title="Top Competitors">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.competitors.map(c => (
                    <div key={c.name} className="p-4 border border-brand-border rounded-lg">
                        <p className="font-bold">{c.name}</p>
                        <p className="text-sm"><strong>Mkt Share:</strong> {c.marketShare}</p>
                        <p className="text-sm"><strong>UVP:</strong> {c.uvp}</p>
                    </div>
                ))}
            </div>
        </Section>
    </div>
);

const FundingSection: React.FC<{ data: import('../../../types').FundingData }> = ({ data }) => (
    <div>
        <Section title="Funding Timeline">
            <div className="relative">
                {data.timeline.map((round, index) => <TimelineEvent key={round.id} round={round} isLast={index === data.timeline.length - 1} />)}
            </div>
        </Section>
        <Section title="Current Round & Capital Structure">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                     <h4 className="font-bold mb-2">Current Round</h4>
                     <div className="p-4 bg-brand-card-light rounded-lg border border-brand-border">
                        <p>Status: <span className={`font-bold ${data.currentRound.status === 'open' ? 'text-green-500' : 'text-gray-500'}`}>{data.currentRound.status.toUpperCase()}</span></p>
                        <p>Target Raise: <span className="font-bold">${data.currentRound.targetRaise.toLocaleString()}</span></p>
                     </div>
                </div>
                <div>
                    <h4 className="font-bold mb-2">Capitalization Table</h4>
                    <PieChart data={data.capTable} title="Ownership" />
                </div>
            </div>
        </Section>
    </div>
);

const RiskLegalSection: React.FC<{ data: import('../../../types').RiskLegalData }> = ({ data }) => (
    <div>
        <Section title="Identified Risks">
            <ul className="list-disc list-inside space-y-2 text-sm text-red-600 dark:text-red-400">
                {data.risks.map(risk => <li key={risk.id}><strong>{risk.label}:</strong> {risk.value}</li>)}
            </ul>
        </Section>
        <Section title="Due Diligence Status">
             <div className="space-y-4">
                {data.diligenceStatus.map(item => (
                    <div key={item.area}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-semibold">{item.area}</span>
                            <span>{item.progress}%</span>
                        </div>
                        <ProgressBar progress={item.progress} colorClass={item.progress === 100 ? 'bg-green-500' : 'bg-brand-primary'} />
                    </div>
                ))}
            </div>
        </Section>
    </div>
);

export default InvestmentTab;