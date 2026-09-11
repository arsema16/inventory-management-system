import { PrismaClient, UserRole, ItemType, ItemStatus, VehicleStatus, RequestStatus, RequestType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning up existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.requestItem.deleteMany();
  await prisma.request.deleteMany();
  await prisma.vehicleSale.deleteMany();
  await prisma.client.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Create Departments
  console.log('📁 Creating departments...');
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Finance' } }),
    prisma.department.create({ data: { name: 'Operations' } }),
    prisma.department.create({ data: { name: 'Warehouse' } }),
    prisma.department.create({ data: { name: 'Procurement' } }),
    prisma.department.create({ data: { name: 'IT' } }),
  ]);

  // Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@taxime.com',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      departmentId: departments[4].id,
    },
  });

  const opsManager = await prisma.user.create({
    data: {
      firstName: 'Operations',
      lastName: 'Manager',
      email: 'ops@taxime.com',
      passwordHash: hashedPassword,
      role: UserRole.OPERATIONS_MANAGER,
      departmentId: departments[1].id,
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      firstName: 'Finance',
      lastName: 'Officer',
      email: 'finance@taxime.com',
      passwordHash: hashedPassword,
      role: UserRole.FINANCE,
      departmentId: departments[0].id,
    },
  });

  const storekeeper = await prisma.user.create({
    data: {
      firstName: 'Store',
      lastName: 'Keeper',
      email: 'store@taxime.com',
      passwordHash: hashedPassword,
      role: UserRole.STOREKEEPER,
      departmentId: departments[2].id,
    },
  });

  const employee = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'employee@taxime.com',
      passwordHash: hashedPassword,
      role: UserRole.EMPLOYEE,
      departmentId: departments[1].id,
    },
  });

  // Create General Inventory Items
  console.log('📦 Creating inventory items...');
  const items = await Promise.all([
    prisma.item.create({
      data: {
        name: 'Office Chair - Ergonomic',
        sku: 'CHAIR-001',
        description: 'High-back ergonomic office chair with lumbar support',
        type: ItemType.GENERAL,
        unit: 'piece',
        quantity: 25,
        minimumQty: 5,
        status: ItemStatus.AVAILABLE,
        location: 'Warehouse A - Aisle 1',
      },
    }),
    prisma.item.create({
      data: {
        name: 'Laptop Charger - Universal',
        sku: 'CHRG-001',
        description: '65W universal laptop charger',
        type: ItemType.GENERAL,
        unit: 'piece',
        quantity: 3,
        minimumQty: 10,
        status: ItemStatus.LOW_STOCK,
        location: 'Warehouse A - Aisle 2',
      },
    }),
    prisma.item.create({
      data: {
        name: 'Printer Paper A4',
        sku: 'PAPER-001',
        description: 'White A4 printer paper, 500 sheets per ream',
        type: ItemType.GENERAL,
        unit: 'ream',
        quantity: 50,
        minimumQty: 20,
        status: ItemStatus.AVAILABLE,
        location: 'Warehouse A - Aisle 3',
      },
    }),
    prisma.item.create({
      data: {
        name: 'USB Flash Drive 32GB',
        sku: 'USB-001',
        description: 'USB 3.0 flash drive 32GB capacity',
        type: ItemType.GENERAL,
        unit: 'piece',
        quantity: 0,
        minimumQty: 15,
        status: ItemStatus.OUT_OF_STOCK,
        location: 'Warehouse A - Aisle 2',
      },
    }),
  ]);

  // Create Vehicle Items and Vehicles
  console.log('🚗 Creating vehicles...');
  const vehicleItem1 = await prisma.item.create({
    data: {
      name: 'Toyota Corolla 2020',
      sku: 'VEH-001',
      type: ItemType.VEHICLE,
      quantity: 1,
      status: ItemStatus.AVAILABLE,
    },
  });

  const vehicle1 = await prisma.vehicle.create({
    data: {
      itemId: vehicleItem1.id,
      vehicleId: 'TOY-COR-2020-001',
      vin: '1HGBH41JXMN109186',
      plateNumber: 'ABC-1234',
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      batteryInfo: 'Standard 12V battery',
      mileage: 45000,
      salePrice: 18500.00,
      status: VehicleStatus.AVAILABLE,
    },
  });

  const vehicleItem2 = await prisma.item.create({
    data: {
      name: 'Honda Civic 2021',
      sku: 'VEH-002',
      type: ItemType.VEHICLE,
      quantity: 1,
      status: ItemStatus.AVAILABLE,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      itemId: vehicleItem2.id,
      vehicleId: 'HON-CIV-2021-001',
      vin: '2HGFC2F59MH123456',
      plateNumber: 'XYZ-5678',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      batteryInfo: 'Enhanced lithium-ion battery',
      mileage: 28000,
      salePrice: 22000.00,
      status: VehicleStatus.AVAILABLE,
    },
  });

  const vehicleItem3 = await prisma.item.create({
    data: {
      name: 'Ford F-150 2019',
      sku: 'VEH-003',
      type: ItemType.VEHICLE,
      quantity: 1,
      status: ItemStatus.RESERVED,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      itemId: vehicleItem3.id,
      vehicleId: 'FOR-F15-2019-001',
      vin: '1FTFW1ET5KFA12345',
      plateNumber: 'DEF-9012',
      make: 'Ford',
      model: 'F-150',
      year: 2019,
      batteryInfo: 'Heavy-duty battery',
      mileage: 62000,
      salePrice: 28500.00,
      status: VehicleStatus.RESERVED,
    },
  });

  // Create Clients
  console.log('👤 Creating clients...');
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        firstName: 'Michael',
        lastName: 'Johnson',
        phone: '+1-555-0101',
        email: 'michael.j@email.com',
        address: '123 Main St, Springfield',
        idNumber: 'ID123456',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Williams',
        phone: '+1-555-0202',
        email: 'sarah.w@email.com',
        address: '456 Oak Ave, Riverside',
        idNumber: 'ID654321',
      },
    }),
  ]);

  // Create Requests
  console.log('📝 Creating requests...');
  const request1 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-000001',
      type: RequestType.INVENTORY,
      status: RequestStatus.PENDING,
      reason: 'Office supplies needed for new employees',
      requestedById: employee.id,
      items: {
        create: [
          {
            itemId: items[0].id,
            quantity: 3,
            notes: 'Need for new hires',
          },
          {
            itemId: items[2].id,
            quantity: 10,
            notes: 'Running low on paper',
          },
        ],
      },
    },
  });

  const request2 = await prisma.request.create({
    data: {
      requestNumber: 'REQ-000002',
      type: RequestType.INVENTORY,
      status: RequestStatus.APPROVED,
      reason: 'IT equipment replacement',
      requestedById: employee.id,
      approvedAt: new Date(),
      items: {
        create: [
          {
            itemId: items[1].id,
            quantity: 5,
            approvedQty: 5,
          },
        ],
      },
    },
  });

  // Create Vehicle Sale
  console.log('💰 Creating vehicle sale...');
  const sale1 = await prisma.vehicleSale.create({
    data: {
      saleNumber: 'SALE-000001',
      vehicleId: vehicle3.id,
      clientId: clients[0].id,
      submittedById: financeUser.id,
      salePrice: 28500.00,
      paymentReference: 'PAY-001-2024',
      status: 'PENDING',
      notes: 'Customer interested in extended warranty',
    },
  });

  // Create Suppliers
  console.log('🏢 Creating suppliers...');
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Office Supplies Inc',
        contactName: 'Robert Smith',
        phone: '+1-555-1000',
        email: 'sales@officesupplies.com',
        address: '789 Business Blvd, Commerce City',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Tech Equipment Co',
        contactName: 'Lisa Anderson',
        phone: '+1-555-2000',
        email: 'orders@techequip.com',
        address: '321 Tech Park, Silicon Valley',
      },
    }),
  ]);

  // Create Notifications
  console.log('🔔 Creating notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: opsManager.id,
        type: 'REQUEST',
        title: 'New Request Pending',
        message: 'Request REQ-000001 requires your approval',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: opsManager.id,
        type: 'VEHICLE_SALE',
        title: 'New Vehicle Sale',
        message: 'Vehicle sale SALE-000001 requires approval',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: storekeeper.id,
        type: 'INVENTORY',
        title: 'Low Stock Alert',
        message: 'Laptop Charger - Universal is running low on stock',
        isRead: false,
      },
    }),
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Departments: ${departments.length}`);
  console.log(`   - Users: 5 (admin, ops manager, finance, storekeeper, employee)`);
  console.log(`   - Inventory Items: ${items.length}`);
  console.log(`   - Vehicles: 3`);
  console.log(`   - Clients: ${clients.length}`);
  console.log(`   - Requests: 2`);
  console.log(`   - Vehicle Sales: 1`);
  console.log(`   - Suppliers: ${suppliers.length}`);
  console.log('\n🔑 Login Credentials:');
  console.log('   - Admin: admin@taxime.com / password123');
  console.log('   - Operations Manager: ops@taxime.com / password123');
  console.log('   - Finance: finance@taxime.com / password123');
  console.log('   - Storekeeper: store@taxime.com / password123');
  console.log('   - Employee: employee@taxime.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
