import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ProductsModule } from './products/products.module';
import { StockBatchesModule } from './stock-batches/stock-batches.module';
import { ShopsModule } from './shops/shops.module';
import { RegionsModule } from './regions/regions.module';
import { AgentsModule } from './agents/agents.module';
import { DriversModule } from './drivers/drivers.module';
import { OrdersModule } from './orders/orders.module';
import { ReturnsModule } from './returns/returns.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { DiscountsModule } from './discounts/discounts.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CompanyModule } from './company/company.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminController } from './admin/admin.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ProductsModule,
    StockBatchesModule,
    ShopsModule,
    RegionsModule,
    AgentsModule,
    DriversModule,
    OrdersModule,
    ReturnsModule,
    InvoicesModule,
    PaymentsModule,
    DiscountsModule,
    PermissionsModule,
    CompanyModule,
    UploadsModule,
  ],
  controllers: [AdminController],
})
export class AppModule {}