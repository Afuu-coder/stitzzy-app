import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

async function main() {
  const email = "afjalambani1@gmail.com";
  try {
    const users = await clerkClient.users.getUserList({ emailAddress: [email] });
    
    if (users.data.length === 0) {
      console.log(`User with email ${email} not found.`);
      return;
    }
    
    const user = users.data[0];
    console.log(`Found user: ${user.id}`);
    
    const updatedUser = await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        role: 'admin'
      }
    });
    
    console.log('Successfully updated user to admin:', updatedUser.publicMetadata);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
