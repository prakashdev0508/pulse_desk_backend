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

  // Create Ticket Categories
  const bugCategory = await prisma.ticketCategories.create({
    data: {
      name: 'Bug Reports',
      description: 'Issues and bugs in the system',
      organizationId: organization.id,
    },
  });

  const featureCategory = await prisma.ticketCategories.create({
    data: {
      name: 'Feature Requests',
      description: 'New feature requests and enhancements',
      organizationId: organization.id,
    },
  });

  // Create Ticket Subcategories
  const loginSubcategory = await prisma.ticketSubCategories.create({
    data: {
      name: 'Login Issues',
      description: 'Problems related to user authentication',
      organizationId: organization.id,
      ticketCategoryId: bugCategory.id,
    },
  });

  const uiSubcategory = await prisma.ticketSubCategories.create({
    data: {
      name: 'UI/UX',
      description: 'User interface and experience improvements',
      organizationId: organization.id,
      ticketCategoryId: featureCategory.id,
    },
  });

  // Create Ticket Groups
  const supportGroup = await prisma.ticketGroup.create({
    data: {
      name: 'Support Team',
      description: 'Main support team for customer issues',
      organizationId: organization.id,
      assignedUsers: {
        connect: [
          { id: adminUser.id },
          { id: managerUser.id }
        ],
      },
    },
  });

  const devGroup = await prisma.ticketGroup.create({
    data: {
      name: 'Development Team',
      description: 'Technical team for bug fixes and features',
      organizationId: organization.id,
      assignedUsers: {
        connect: [
          { id: normalUser.id }
        ],
      },
    },
  });

  // Create Ticket Statuses
  const openStatus = await prisma.ticketStatuses.create({
    data: {
      name: 'Open',
      description: 'New ticket that needs attention',
      organizationId: organization.id,
    },
  });

  const inProgressStatus = await prisma.ticketStatuses.create({
    data: {
      name: 'In Progress',
      description: 'Ticket is being worked on',
      organizationId: organization.id,
    },
  });

  // Create Ticket Customers
  const customer1 = await prisma.ticketCustomer.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567891',
      organizationId: organization.id,
    },
  });

  const customer2 = await prisma.ticketCustomer.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567892',
      organizationId: organization.id,
    },
  });

  // Create Escalation Rules
  const highPriorityRule = await prisma.ticketEscalationRules.create({
    data: {
      name: 'High Priority Escalation',
      description: 'Escalation rules for high priority tickets',
      organizationId: organization.id,
      categoryId: bugCategory.id,
      priority: 'HIGH',
      responseTime: 30, // 30 minutes
      resolutionTime: 240, // 4 hours
      escalationLevels: JSON.stringify([
        { level: 1, time: 30, notify: 'support_team' },
        { level: 2, time: 60, notify: 'management' },
        { level: 3, time: 120, notify: 'executive' },
      ]),
    },
  });

  // Create Tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Login Page Not Working',
      description: 'Users unable to access the login page',
      priority: 'HIGH',
      categoryId: bugCategory.id,
      subCategoryId: loginSubcategory.id,
      customerId: customer1.id,
      statusID: openStatus.id,
      organizationId: organization.id,
      assignedgroupId: supportGroup.id,
      escalationRuleId: highPriorityRule.id,
      customFields: JSON.stringify({
        browser: 'Chrome',
        os: 'Windows 10',
      }),
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Request Dark Mode',
      description: 'Add dark mode theme to the application',
      priority: 'MEDIUM',
      categoryId: featureCategory.id,
      subCategoryId: uiSubcategory.id,
      customerId: customer2.id,
      statusID: inProgressStatus.id,
      organizationId: organization.id,
      assignedgroupId: devGroup.id,
    },
  });

  // Add Ticket Comments
  await prisma.ticketComments.create({
    data: {
      ticketId: ticket1.id,
      comment: 'Investigating the login issue. Will update soon.',
    },
  });

  await prisma.ticketComments.create({
    data: {
      ticketId: ticket2.id,
      comment: 'Dark mode design is in progress.',
    },
  });

  // Create Ticket Escalations
  await prisma.ticketEscalations.create({
    data: {
      ticketId: ticket1.id,
      level: 1,
      escalatedTo: supportGroup.id,
      notes: 'Initial escalation to support team',
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
