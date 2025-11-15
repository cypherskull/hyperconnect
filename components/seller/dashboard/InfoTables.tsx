import React from 'react';
import { Post, Enquiry, MeetingRequest, CompanyProfile, User } from '../../../types';
import { MessageIcon, CalendarIcon } from '../../common/Icons';

const Table: React.FC<{ title: string; headers: string[]; children: React.ReactNode }> = ({ title, headers, children }) => (
    <div className="bg-brand-card rounded-lg shadow-md border border-brand-border overflow-hidden">
        <h3 className="text-lg font-bold text-brand-accent p-4">{title}</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-brand-card-light text-xs uppercase">
                    <tr>
                        {headers.map(h => <th key={h} scope="col" className="px-6 py-3 whitespace-nowrap">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    </div>
);

const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <tr className="border-b border-brand-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
        {children}
    </tr>
);

const Td: React.FC<{ children: React.ReactNode; isMedium?: boolean }> = ({ children, isMedium = false }) => (
    <td className={`px-6 py-4 whitespace-nowrap ${isMedium ? 'font-medium' : ''}`}>
        {children}
    </td>
);


interface InfoTablesProps {
    topPosts: (Post & { engagement: number })[];
    recentActivity: (Enquiry | MeetingRequest)[];
    engagedCompanies: CompanyProfile[];
    users: User[];
}

export const InfoTables: React.FC<InfoTablesProps> = ({ topPosts, recentActivity, engagedCompanies, users }) => {

    const getActivityIcon = (activity: Enquiry | MeetingRequest) => {
        if ('message' in activity) {
            return <span title="Enquiry"><MessageIcon className="w-5 h-5 text-blue-500" /></span>;
        }
        const statusColor = activity.status === 'accepted' ? 'text-green-500' : activity.status === 'declined' ? 'text-red-500' : 'text-yellow-500';
        return <span title={`Meeting: ${activity.status}`}><CalendarIcon className={`w-5 h-5 ${statusColor}`} /></span>;
    }

  return (
    <div className="space-y-8">
        <Table title="Top Performing Posts" headers={['Post Title', 'Engagement']}>
            {topPosts.map(post => (
                <TableRow key={post.id}>
                    <Td isMedium>{post.title}</Td>
                    <Td>{post.engagement.toLocaleString()}</Td>
                </TableRow>
            ))}
        </Table>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Table title="Recent Activity" headers={['Type', 'From', 'Date']}>
                {recentActivity.map(activity => {
                     const user = users.find(u => u.id === activity.userId);
                     return (
                        <TableRow key={activity.id}>
                            <Td>{getActivityIcon(activity)}</Td>
                            <Td isMedium>{user ? `${user.name}, ${user.company}` : 'Unknown User'}</Td>
                            <Td>{new Date(activity.timestamp).toLocaleDateString()}</Td>
                        </TableRow>
                     )
                })}
            </Table>
            <Table title="Engaged Companies" headers={['Company', 'Sector', 'Size']}>
                 {engagedCompanies.map(company => (
                    <TableRow key={company.id}>
                        <Td isMedium>
                            <div className="flex items-center space-x-2">
                                <img src={company.logoUrl} alt={company.name} className="w-6 h-6 rounded-full"/>
                                <span>{company.name}</span>
                            </div>
                        </Td>
                        <Td>{company.sector}</Td>
                        <Td>{company.employees.toLocaleString()} emp.</Td>
                    </TableRow>
                ))}
            </Table>
        </div>
    </div>
  );
};