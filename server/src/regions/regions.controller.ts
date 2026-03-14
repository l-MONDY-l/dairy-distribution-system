import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { CreateTownDto } from './dto/create-town.dto';

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

  @Get('districts')
  getDistricts() {
    return this.regionsService.getDistricts();
  }

  @Post('districts')
  createDistrict(
    @Body('name') name: string,
    @Body('regionId') regionId: string,
  ) {
    return this.regionsService.createDistrict(name, regionId);
  }

  @Patch('districts/:id')
  updateDistrict(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('status') status?: boolean,
    @Body('regionId') regionId?: string,
  ) {
    return this.regionsService.updateDistrict(id, { name, status, regionId });
  }

  @Delete('districts/:id')
  deleteDistrict(@Param('id') id: string) {
    return this.regionsService.deleteDistrict(id);
  }

  @Get('cities')
  getCities() {
    return this.regionsService.getCities();
  }

  @Post('cities')
  createCity(@Body('name') name: string, @Body('districtId') districtId: string) {
    return this.regionsService.createCity(name, districtId);
  }

  @Patch('cities/:id')
  updateCity(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('status') status?: boolean,
    @Body('districtId') districtId?: string,
  ) {
    return this.regionsService.updateCity(id, { name, status, districtId });
  }

  @Delete('cities/:id')
  deleteCity(@Param('id') id: string) {
    return this.regionsService.deleteCity(id);
  }

  @Get('towns')
  getTowns() {
    return this.regionsService.getTowns();
  }

  @Post('towns')
  createTown(@Body() dto: CreateTownDto) {
    return this.regionsService.createTown(dto.name, dto.cityId);
  }

  @Patch('towns/:id')
  updateTown(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('status') status?: boolean,
  ) {
    return this.regionsService.updateTown(id, { name, status });
  }

  @Delete('towns/:id')
  deleteTown(@Param('id') id: string) {
    return this.regionsService.deleteTown(id);
  }

  // Assignment options (shared)
  @Get('assignment-options')
  getAssignmentOptions() {
    return this.regionsService.getAssignmentOptions();
  }

  // Town assignment endpoints first (more specific than :cityId)
  @Get('assignments/towns')
  getTownAssignments() {
    return this.regionsService.getTownAssignments();
  }

  @Put('assignments/towns/:townId')
  upsertTownAssignment(
    @Param('townId') townId: string,
    @Body('agentId') agentId: string,
    @Body('driverId') driverId: string,
  ) {
    return this.regionsService.upsertTownAssignment({ townId, agentId, driverId });
  }

  @Delete('assignments/towns/:townId')
  deleteTownAssignment(@Param('townId') townId: string) {
    return this.regionsService.deleteTownAssignment(townId);
  }

  // City assignment endpoints (legacy)
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