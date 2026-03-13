import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { RegionsService } from './regions.service';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  getRegions() {
    return this.regionsService.getRegions();
  }

  @Post()
  createRegion(@Body('name') name: string) {
    return this.regionsService.createRegion(name);
  }

  @Patch(':id')
  updateRegion(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('status') status?: boolean,
  ) {
    return this.regionsService.updateRegion(id, { name, status });
  }

  @Delete(':id')
  deleteRegion(@Param('id') id: string) {
    return this.regionsService.deleteRegion(id);
  }

  @Get('cities')
  getCities() {
    return this.regionsService.getCities();
  }

  @Post('cities')
  createCity(@Body('name') name: string, @Body('regionId') regionId: string) {
    return this.regionsService.createCity(name, regionId);
  }

  @Patch('cities/:id')
  updateCity(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('status') status?: boolean,
    @Body('regionId') regionId?: string,
  ) {
    return this.regionsService.updateCity(id, { name, status, regionId });
  }

  @Delete('cities/:id')
  deleteCity(@Param('id') id: string) {
    return this.regionsService.deleteCity(id);
  }

  // City assignment endpoints

  @Get('assignments')
  getAssignments() {
    return this.regionsService.getCityAssignments();
  }

  @Put('assignments/:cityId')
  upsertAssignment(
    @Param('cityId') cityId: string,
    @Body('agentId') agentId: string,
    @Body('driverId') driverId: string,
  ) {
    return this.regionsService.upsertCityAssignment({ cityId, agentId, driverId });
  }

  @Delete('assignments/:cityId')
  deleteAssignment(@Param('cityId') cityId: string) {
    return this.regionsService.deleteCityAssignment(cityId);
  }

  @Post('seed')
  seedDefaults() {
    return this.regionsService.seedDefaults();
  }
}