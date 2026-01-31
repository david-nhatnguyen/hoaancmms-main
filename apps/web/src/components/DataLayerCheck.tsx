import { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { User } from '@/api/mock/systemData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DataLayerCheck() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await userService.getAll();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading data from Service Layer...</div>;

  return (
    <Card className="w-[350px] mt-4">
      <CardHeader>
        <CardTitle>Data Layer Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          Loaded {users.length} users from <code>userService</code>
        </p>
        <ul className="list-disc pl-4 text-sm">
          {users.slice(0, 3).map(u => (
            <li key={u.id}>{u.fullName} ({u.role})</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
