
import React, { useState } from 'react';
import { Seller, FinancialStatementEntry, FundingRound, DueDiligenceData, ComparisonMetric } from '../../../types';
import { TabButton } from '../../common/TabButton';
import { BarChart } from '../../common/BarChart';
import { PieChart } from '../../common/PieChart';
import { ProgressBar } from '../../common/ProgressBar';
import { PencilIcon, ChartBarIcon, UsersIcon, CurrencyDollarIcon, ShieldCheckIcon } from '../../common/Icons';
import { InvestmentDataEditorModal } from './InvestmentDataEditorModal';
import { ComparisonTable } from '../../common/ComparisonTable';

type InvestmentSubTab = 'summary' | 'financials' | 'commercials' | 'funding' | 'risk';

const KpiCard: React.FC<{ title: string; value: string; subtext?: string; icon?: React.ReactNode }> = ({ title, value, subtext, icon }) => (
    <div className="bg-brand-card-light p-4 rounded-lg border border-brand-border/50 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-brand-accent">{value}</p>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
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

const StatementTable: React.FC<{ title: string, headers: string[], rows: { label: string, values: (string | number)[] }[] }> = ({ title, headers, rows }) => (
    <div className="bg-brand-card rounded-lg border border-brand-border overflow-hidden">
        <div className="bg-brand-card-light px-4 py-2 border-b border-brand-border">
            <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">{title}</h4>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-right text-xs font-semibold text-gray-500 uppercase">
                        <th className="px-4 py-2 text-left">Line Item</th>
                        {headers.map(h => <th key={h} className="px-4 py-2">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                    {rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            <td className="px-4 py-2 font-medium text-left">{row.label}</td>
                            {row.values.map((v, i) => (
                                <td key={i} className="px-4 py-2 font-mono text-gray-700 dark:text-gray-300">
                                    {typeof v === 'number' ? v.toLocaleString() : v}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
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

    if (!dueDiligence) {
        return (
            <div className="bg-brand-card rounded-lg shadow-md border border-brand-border p-8 text-center">
                <p className="text-gray-500 mb-4">You have not initialized your Investment / Due Diligence profile yet.</p>
                {isOwner && onUpdateDueDiligence ? (
                    <>
                        <button
                            onClick={() => setIsEditorOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-secondary"
                        >
                            Initialize Investment Profile
                        </button>
                        {isEditorOpen && (
                            <InvestmentDataEditorModal
                                initialData={{
                                    executiveSummary: '',
                                    financials: { statements: [], keyRatios: [], revenueBreakdown: { recurring: 0, oneTime: 0, sources: [], historicGrowth: [] }, risks: [] },
                                    commercials: { marketOverview: { size: '', cagr: '', trends: [], segments: [] }, customerMetrics: { count: 0, cac: '', churnRate: '', ltv: '' }, marketShare: '', uvp: '', mainCompetitors: [], salesPipeline: { topClients: [], conversionRates: '', revenueConcentration: '' }, competitiveLandscape: [] },
                                    funding: { timeline: [], currentRound: { status: 'closed', targetRaise: 0 }, capTable: [] },
                                    riskAndLegal: { risks: [], diligenceStatus: [] }
                                }}
                                onClose={() => setIsEditorOpen(false)}
                                onSave={(data) => {
                                    if (onUpdateDueDiligence) {
                                        onUpdateDueDiligence(seller.id, data);
                                    }
                                    setIsEditorOpen(false);
                                }}
                            />
                        )}
                    </>
                ) : (
                    <p className="text-gray-500">Data not available.</p>
                )}
            </div>
        );
    }

    const handleSave = (data: DueDiligenceData) => {
        if (onUpdateDueDiligence) {
            onUpdateDueDiligence(seller.id, data);
        }
        setIsEditorOpen(false);
    }

    const renderContent = () => {
        switch (activeTab) {
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
    const years = data.statements.map(s => s.year.toString()).reverse();
    const sortedStatements = [...data.statements].sort((a, b) => a.year - b.year);

    // Helper for generating statement rows
    const getRows = (keys: (keyof FinancialStatementEntry)[], labels: string[]) => {
        return keys.map((key, i) => ({
            label: labels[i],
            values: sortedStatements.map(s => s[key])
        }));
    };

    const incomeRows = getRows(
        ['revenue', 'cogs', 'grossProfit', 'operatingExpenses', 'ebitda', 'netIncome'],
        ['Total Revenue', 'COGS', 'Gross Profit', 'Operating Expenses', 'EBITDA', 'Net Income']
    );

    const balanceRows = getRows(
        ['cashAndEquivalents', 'totalAssets', 'currentLiabilities', 'longTermDebt', 'totalLiabilities', 'equity'],
        ['Cash & Equivalents', 'Total Assets', 'Current Liabilities', 'Long-term Debt', 'Total Liabilities', 'Total Equity']
    );

    const cashFlowRows = getRows(
        ['operatingCashFlow', 'investingCashFlow', 'financingCashFlow', 'netChangeInCash'],
        ['Operating Cash Flow', 'Investing Cash Flow', 'Financing Cash Flow', 'Net Change in Cash']
    );

    const historicGrowthData = data.revenueBreakdown.historicGrowth.map(g => ({
        name: g.year.toString(),
        value: g.revenue,
        color: '#4D96FF',
        tooltipData: { 'Revenue': `₹${(g.revenue / 10000000).toFixed(2)} Cr` }
    }));

    return (
        <div>
            <Section title="Financial Statements (Last 3 Years)">
                <div className="space-y-6">
                    <StatementTable title="Income Statement" headers={years} rows={incomeRows} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatementTable title="Balance Sheet" headers={years} rows={balanceRows} />
                        <StatementTable title="Cash Flow Statement" headers={years} rows={cashFlowRows} />
                    </div>
                </div>
            </Section>

            <Section title="Financial Ratio Comparison">
                <ComparisonTable
                    title="Key Efficiency & Liquidity Ratios"
                    metrics={data.keyRatios}
                    competitor1Name={data.keyRatios[0]?.competitor1 ? "Competitor A" : "Comp 1"}
                    competitor2Name={data.keyRatios[0]?.competitor2 ? "Competitor B" : "Comp 2"}
                />
            </Section>

            <Section title="Revenue Analysis">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        <h4 className="font-bold mb-4">Historical Revenue Growth</h4>
                        <BarChart data={historicGrowthData} />
                        <div className="mt-4 p-4 bg-brand-card-light rounded-lg">
                            <p className="text-sm font-semibold mb-2">Revenue Type Breakdown</p>
                            <div className="flex items-center gap-4 text-sm">
                                <div><span className="font-bold text-brand-primary">{data.revenueBreakdown.recurring}%</span> Recurring</div>
                                <div><span className="font-bold text-gray-500">{data.revenueBreakdown.oneTime}%</span> One-time</div>
                            </div>
                            <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
                                <div className="bg-brand-primary h-full" style={{ width: `${data.revenueBreakdown.recurring}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Revenue Sources</h4>
                        <PieChart data={data.revenueBreakdown.sources} title="Revenue Mix" />
                    </div>
                </div>
            </Section>

            <Section title="Financial Risks">
                <div className="grid grid-cols-1 gap-3">
                    {data.risks.map(risk => (
                        <div key={risk.id} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-3">
                            <ShieldCheckIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-red-800 dark:text-red-200 block">{risk.label}</span>
                                <span className="text-sm text-red-700 dark:text-red-300">{risk.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
};

const CommercialsSection: React.FC<{ data: import('../../../types').CommercialsData }> = ({ data }) => (
    <div>
        <Section title="Market Overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-brand-card-light p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Total Addressable Market (TAM)</p>
                    <p className="text-3xl font-bold text-brand-primary">{data.marketOverview.size}</p>
                </div>
                <div className="bg-brand-card-light p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">CAGR</p>
                    <p className="text-3xl font-bold text-green-500">{data.marketOverview.cagr}</p>
                </div>
                <div className="bg-brand-card-light p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2 text-center">Target Segments</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {data.marketOverview.segments.map(s => <span key={s} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{s}</span>)}
                    </div>
                </div>
            </div>
            <div className="bg-brand-card-light p-4 rounded-lg border-l-4 border-brand-primary">
                <p className="font-bold mb-1">Key Market Trends:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                    {data.marketOverview.trends.map(t => <li key={t}>{t}</li>)}
                </ul>
            </div>
        </Section>

        <Section title="Customer Economics">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <KpiCard title="Active Customers" value={data.customerMetrics.count.toString()} icon={<UsersIcon className="w-5 h-5 text-blue-500" />} />
                <KpiCard title="CAC" value={data.customerMetrics.cac} subtext="Cust. Acquisition Cost" icon={<CurrencyDollarIcon className="w-5 h-5 text-red-500" />} />
                <KpiCard title="LTV" value={data.customerMetrics.ltv} subtext="Lifetime Value" icon={<ChartBarIcon className="w-5 h-5 text-green-500" />} />
                <KpiCard title="Churn Rate" value={data.customerMetrics.churnRate} subtext="Annual" />
                <KpiCard title="MAU" value={data.customerMetrics.mau || 'N/A'} subtext="Monthly Active Users" />
            </div>
        </Section>

        <Section title="Competitive Landscape">
            <ComparisonTable
                title="Business vs Competitors Analysis"
                metrics={data.competitiveLandscape}
                competitor1Name={data.mainCompetitors[0]?.name || "Competitor 1"}
                competitor2Name={data.mainCompetitors[1]?.name || "Competitor 2"}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 bg-brand-card-light rounded-lg border border-brand-border">
                    <p className="text-sm font-semibold text-gray-500">Our Market Share</p>
                    <p className="text-3xl font-bold">{data.marketShare}</p>
                </div>
                <div className="p-4 bg-brand-card-light rounded-lg border border-brand-border">
                    <p className="text-sm font-semibold text-gray-500">Unique Value Proposition</p>
                    <p className="font-medium mt-1 text-brand-primary">{data.uvp}</p>
                </div>
            </div>
        </Section>

        <Section title="Sales Pipeline & Concentration">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-5 bg-brand-card-light rounded-lg border border-brand-border/50">
                    <h4 className="font-bold mb-3 flex items-center gap-2"><UsersIcon className="w-4 h-4" /> Top Clients</h4>
                    <ul className="space-y-2 text-sm">
                        {data.salesPipeline.topClients.map((client, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                {client}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-brand-card-light rounded-lg">
                        <p className="text-sm font-semibold text-gray-500">Avg. Sales Conversion Rate</p>
                        <p className="text-2xl font-bold">{data.salesPipeline.conversionRates}</p>
                    </div>
                    <div className="p-4 bg-brand-card-light rounded-lg">
                        <p className="text-sm font-semibold text-gray-500">Revenue Concentration Risk</p>
                        <p className="font-medium">{data.salesPipeline.revenueConcentration}</p>
                    </div>
                </div>
            </div>
        </Section>
    </div>
);

const FundingSection: React.FC<{ data: import('../../../types').FundingData }> = ({ data }) => (
    <div>
        <Section title="Funding Timeline">
            <div className="relative space-y-4">
                {data.timeline.map((round, index) => <TimelineEvent key={round.id} round={round} isLast={index === data.timeline.length - 1} />)}
            </div>
        </Section>
        <Section title="Current Round & Capital Structure">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-bold mb-2">Current Round Status</h4>
                    <div className="p-6 bg-brand-card-light rounded-lg border border-brand-border flex flex-col items-center justify-center text-center h-64">
                        <p className="text-lg">Round Status</p>
                        <p className={`text-3xl font-bold my-2 ${data.currentRound.status === 'open' ? 'text-green-500' : 'text-gray-500'}`}>
                            {data.currentRound.status.toUpperCase()}
                        </p>
                        {data.currentRound.status === 'open' && (
                            <>
                                <p className="text-sm text-gray-500 mt-2">Target Raise</p>
                                <p className="text-2xl font-bold">${data.currentRound.targetRaise.toLocaleString()}</p>
                            </>
                        )}
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
