import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      page = 0,
      limit = 10,
      search = '',
      type = '',
      account = '',
      category = '',
      tag = '',
      sortBy = 'date',
      sortOrder = 'desc',
      transactions = [],
      accounts = [],
      categories = []
    } = body;
    // Create maps for filtering
    const accountMap = Object.fromEntries(accounts.map((a: any) => [a.id, a.name]));
    const categoryMap = Object.fromEntries(categories.map((c: any) => [c.id, c.name]));

    // Filter transactions
    const filtered = transactions.filter((t: any) => {
      const matchesSearch = search === '' || 
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())) ||
        accountMap[t.account_id]?.toLowerCase().includes(search.toLowerCase()) ||
        categoryMap[t.category_id]?.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = type === '' || t.type === type;
      const matchesAccount = account === '' || t.account_id === account;
      const matchesCategory = category === '' || t.category_id === category;
      const matchesTag = tag === '' || t.tags.includes(tag);
      
      return matchesSearch && matchesType && matchesAccount && matchesCategory && matchesTag;
    });

    // Sort transactions
    filtered.sort((a: any, b: any) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).valueOf() - new Date(b.date).valueOf();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'type') {
        comparison = a.type.localeCompare(b.type);
      } else if (sortBy === 'currency') {
        comparison = a.currency.localeCompare(b.currency);
      } else if (sortBy === 'account') {
        comparison = (accountMap[a.account_id] || '').localeCompare(accountMap[b.account_id] || '');
      } else if (sortBy === 'category') {
        comparison = (categoryMap[a.category_id] || '').localeCompare(categoryMap[b.category_id] || '');
      } else if (sortBy === 'description') {
        comparison = (a.description || '').localeCompare(b.description || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = filtered.length;
    const offset = page * limit;
    const paginatedTransactions = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      transactions: paginatedTransactions,
      total,
      page,
      limit
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}