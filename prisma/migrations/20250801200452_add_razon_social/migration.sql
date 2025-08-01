-- AlterTable
ALTER TABLE "Visita" ADD COLUMN     "poliza" TEXT,
ADD COLUMN     "tipoNegocio" TEXT,
ADD COLUMN     "tipoVisita" TEXT,
ADD COLUMN     "vigenciaInicio" TIMESTAMP(3),
ADD COLUMN     "vigenciaTermino" TIMESTAMP(3);
