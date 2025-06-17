const mockTickets = [
    { ticketId: '001', ticketName: 'CloudShell Ticket', ticketGroup: 'CloudShell' },
    { ticketId: '002', ticketName: 'RDS Ticket', ticketGroup: 'RDS' },
    { ticketId: '003', ticketName: 'CloudWatch Ticket', ticketGroup: 'CloudWatch' },
    { ticketId: '004', ticketName: 'S3 Ticket', ticketGroup: 'S3' },
    { ticketId: '005', ticketName: 'Lambda Ticket', ticketGroup: 'Lambda' },
];

function validateTicket(ticketId, userGroups) {
    const ticket = mockTickets.find(t => t.ticketId === ticketId);
    if (!ticket) return { valid: false, reason: 'Ticket not found' };

    if (!userGroups.includes(ticket.ticketGroup)) {
        return { valid: false, reason: 'User not in ticket group' };
    }

    return { valid: true, ticket };
}

module.exports = {
    validateTicket,
};
