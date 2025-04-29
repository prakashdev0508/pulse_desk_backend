import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Organizations
  const organization = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      address: '123 Main St, City',
      phone: '+1234567890',
      email: 'contact@acmecorp.com',
    },
  });

  // Create Roles
  const accountOwnerRole = await prisma.roles.create({
    data: {
      role_name: 'Account Owner',
      role_slug: 'account_owner',
      organizationId: organization.id,
    },
  });

  const adminRole = await prisma.roles.create({
    data: {
      role_name: 'Admin',
      role_slug: 'admin',
      organizationId: organization.id,
    },
  });

  const managerRole = await prisma.roles.create({
    data: {
      role_name: 'Project Manager',
      role_slug: 'project_manager',
      organizationId: organization.id,
    },
  });

  const userRole = await prisma.roles.create({
    data: {
      role_name: 'User',
      role_slug: 'user',
      organizationId: organization.id,
    },
  });

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Alice Admin',
      email: 'alice.admin@example.com',
      password: 'password',
      refreshToken: 'thisisarefreshtoken',
      organizationId: organization.id,
      userRoles: {
        create: {
          roleId: accountOwnerRole.id,
        },
      },
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: 'Bob Manager',
      email: 'bob.manager@example.com',
      password: 'password',
      refreshToken: 'thisisarefreshtokedssn',
      organizationId: organization.id,
      userRoles: {
        create: {
          roleId: managerRole.id,
        },
      },
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      name: 'Charlie User',
      email: 'charlie.user@example.com',
      password: 'password',
      refreshToken: 'thisisarjsdefreshtoken',
      organizationId: organization.id,
      userRoles: {
        create: {
          roleId: userRole.id,
        },
      },
    },
  });

  // Create PricingPlan
  const basicPlan = await prisma.pricingPlan.create({
    data: {
      name: 'Basic',
      description: 'Essential features for small teams',
      price: 9.99,
      currency: 'USD',
      billingCycle: 'monthly',
      maxUsers: 5,
      maxProjects: 3
    }
  });

  const proPlan = await prisma.pricingPlan.create({
    data: {
      name: 'Professional',
      description: 'Advanced features for growing teams',
      price: 29.99,
      currency: 'USD',
      billingCycle: 'monthly',
      maxUsers: 15,
      maxProjects: 10
    }
  });

  // Create Project
  const project = await prisma.project.create({
    data: {
      name: 'Internal Dashboard',
      description: 'Building internal tools for the company',
      organizationId: organization.id,
    },
  });

  // Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Setup Authentication',
      description: 'Implement login/logout using JWT',
      status: 'IN_PROGRESS',
      organizationId: organization.id,
      projectId: project.id,
      assignedToId: normalUser.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Build Admin Panel',
      description: 'Create the UI for admin to manage users',
      status: 'PENDING',
      organizationId: organization.id,
      projectId: project.id,
      assignedToId: managerUser.id,
    },
  });

  // Create Tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Bug: User not able to login',
      description: 'User reports 500 error during login attempt',
      priority: 'HIGH',
      status: 'OPEN',
      organizationId: organization.id,
      projectId: project.id,
      assignedToId: normalUser.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Feature: Allow SSO login',
      description: 'Request to add Google and Microsoft SSO',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      organizationId: organization.id,
      projectId: project.id,
      assignedToId: managerUser.id,
    },
  });

  // Add Comments on Tasks
  await prisma.taskComment.create({
    data: {
      content: 'Started working on this today.',
      taskId: task1.id,
    },
  });

  await prisma.taskComment.create({
    data: {
      content: 'Waiting for UI designs to be finalized.',
      taskId: task2.id,
    },
  });

  // Add Comments on Tickets
  await prisma.ticketComment.create({
    data: {
      content: 'Investigating the login issue.',
      ticketId: ticket1.id,
    },
  });

  await prisma.ticketComment.create({
    data: {
      content: 'SSO integration planned for next sprint.',
      ticketId: ticket2.id,
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
