import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

const campaignData = [
  {
    name: 'Welcome Series',
    email: 'New subscriber onboarding',
    avatar: 'https://api.slingacademy.com/public/sample-users/1.png',
    fallback: 'WS',
    amount: '2,450 sent'
  },
  {
    name: 'Product Launch',
    email: 'New feature announcement',
    avatar: 'https://api.slingacademy.com/public/sample-users/2.png',
    fallback: 'PL',
    amount: '1,890 sent'
  },
  {
    name: 'Newsletter Weekly',
    email: 'Weekly digest content',
    avatar: 'https://api.slingacademy.com/public/sample-users/3.png',
    fallback: 'NW',
    amount: '5,670 sent'
  },
  {
    name: 'Abandoned Cart',
    email: 'Recovery campaign',
    avatar: 'https://api.slingacademy.com/public/sample-users/4.png',
    fallback: 'AC',
    amount: '890 sent'
  },
  {
    name: 'Holiday Promo',
    email: 'Seasonal promotion',
    avatar: 'https://api.slingacademy.com/public/sample-users/5.png',
    fallback: 'HP',
    amount: '3,240 sent'
  }
];

export function RecentSales() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Campaigns</CardTitle>
        <CardDescription>Latest email campaigns sent this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {campaignData.map((campaign, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={campaign.avatar} alt='Avatar' />
                <AvatarFallback>{campaign.fallback}</AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>{campaign.name}</p>
                <p className='text-muted-foreground text-sm'>{campaign.email}</p>
              </div>
              <div className='ml-auto font-medium'>{campaign.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
