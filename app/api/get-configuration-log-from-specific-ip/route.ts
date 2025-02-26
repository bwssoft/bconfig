import configurationLogRepository from "../../lib/repository/mongodb/configuration-log.repository";
import * as XLSX from "xlsx";
import fs from "fs";

export async function GET() {
  try {
    // Executar a agregação com allowDiskUse
    const cursor = await configurationLogRepository.aggregate(
      [
        {
          $match: {
            model: "E3+4G",
            $and: [
              {
                "actual_profile.ip.primary.ip": "186.202.137.85",
              },
              {
                "actual_profile.ip.secondary.ip": "186.202.137.85",
              },
            ],
          },
        },
        {
          $group: {
            _id: {
              port_1: "$actual_profile.ip.primary.port",
              port_2: "$actual_profile.ip.secondary.port",
            },
            count: { $sum: 1 },
            data: {
              $push: {
                imei: "$imei",
                profile_name: "$profile_name",
              },
            },
          },
        },
      ],
      { allowDiskUse: true }
    );
    const data = await cursor.toArray();

    // Criar um novo workbook
    const workbook = XLSX.utils.book_new();

    // Para cada documento, criar uma aba com o título igual ao _id
    data.forEach((doc: any) => {
      // Preparar os dados para essa aba (pode ser apenas uma linha ou mais)
      const sheetData = doc.data.map(({ imei, profile_name }: any) => ({
        imei,
        profile_name,
      }));

      // Converter os dados para uma worksheet
      const worksheet = XLSX.utils.json_to_sheet(sheetData);

      // Adicionar a worksheet ao workbook, usando o _id como título da aba
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        String(`porta-1-${doc._id.port_1} porta-2-${doc._id.port_2}`)
      );
    });

    // Gerar o arquivo XLSX em buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Salvar o arquivo no sistema de arquivos
    const filePath = "get-configuration-log-from-specific-ip.xlsx";
    fs.writeFileSync(filePath, buffer);

    console.log(`Arquivo salvo em: ${filePath}`);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar arquivo XLSX:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao gerar arquivo XLSX" }),
      { status: 500 }
    );
  }
}
